import imageCompression from "browser-image-compression"

import { supabaseBrowser } from "@/shared/lib/supabase/browser"

const BUCKET_NAME = "TRAFKINTU"
const MAX_SIZE_MB = 5
const MAX_WIDTH_PX = 1200
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export interface UploadResult {
  url: string
  path: string
}

export interface UploadError {
  message: string
  code: "INVALID_TYPE" | "TOO_LARGE" | "UPLOAD_FAILED" | "NO_AUTH"
}

/**
 * Validates file type and size before upload
 */
function validateFile(file: File): UploadError | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      message: "Formato no soportado. Usa JPG, PNG o WebP.",
      code: "INVALID_TYPE",
    }
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return {
      message: `El archivo es muy grande. Máximo ${MAX_SIZE_MB}MB.`,
      code: "TOO_LARGE",
    }
  }

  return null
}

/**
 * Compresses and resizes image before upload
 */
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: MAX_WIDTH_PX,
    useWebWorker: true,
    fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
  }

  try {
    return await imageCompression(file, options)
  } catch {
    // If compression fails, return original file
    return file
  }
}

/**
 * Generates a unique file path for storage
 */
function generateFilePath(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg"
  return `${userId}/${timestamp}-${random}.${ext}`
}

/**
 * Uploads an image to Supabase Storage
 * - Validates file type and size
 * - Compresses and resizes image
 * - Returns public URL
 */
export async function uploadImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult | UploadError> {
  // Validate file
  const validationError = validateFile(file)
  if (validationError) {
    return validationError
  }

  // Get Supabase client
  const supabase = supabaseBrowser()
  if (!supabase) {
    return {
      message: "No se pudo conectar al servidor.",
      code: "NO_AUTH",
    }
  }

  // Compress image
  onProgress?.(10)
  const compressedFile = await compressImage(file)
  onProgress?.(30)

  // Generate unique path
  const filePath = generateFilePath(userId, file.name)

  // Upload to Supabase Storage
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, compressedFile, {
    cacheControl: "3600",
    upsert: false,
  })

  onProgress?.(90)

  if (error) {
    console.error("[uploadImage] Upload error:", error)
    return {
      message: "Error al subir la imagen. Intenta de nuevo.",
      code: "UPLOAD_FAILED",
    }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  onProgress?.(100)

  return {
    url: publicUrl,
    path: filePath,
  }
}

/**
 * Uploads multiple images in sequence
 */
export async function uploadImages(
  files: File[],
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ results: UploadResult[]; errors: UploadError[] }> {
  const results: UploadResult[] = []
  const errors: UploadError[] = []

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, files.length)
    const result = await uploadImage(files[i], userId)

    if ("url" in result) {
      results.push(result)
    } else {
      errors.push(result)
    }
  }

  onProgress?.(files.length, files.length)
  return { results, errors }
}

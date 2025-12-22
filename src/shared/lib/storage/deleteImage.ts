import { supabaseBrowser } from "@/shared/lib/supabase/browser"

const BUCKET_NAME = "TRAFKINTU"

/**
 * Extracts the storage path from a public URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/TRAFKINTU/user-id/image.jpg
 * Returns: user-id/image.jpg
 */
function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/TRAFKINTU\/(.+)/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}

/**
 * Checks if a URL is from our Supabase Storage bucket
 */
export function isStorageUrl(url: string): boolean {
  return url.includes("/storage/v1/object/public/TRAFKINTU/")
}

/**
 * Deletes an image from Supabase Storage by its public URL
 * Only works for images in our TRAFKINTU bucket
 */
export async function deleteImage(url: string): Promise<boolean> {
  // Only delete images from our storage bucket
  if (!isStorageUrl(url)) {
    // External URL (e.g., Unsplash), nothing to delete
    return true
  }

  const path = extractPathFromUrl(url)
  if (!path) {
    console.warn("[deleteImage] Could not extract path from URL:", url)
    return false
  }

  const supabase = supabaseBrowser()
  if (!supabase) {
    console.warn("[deleteImage] No Supabase client available")
    return false
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    console.error("[deleteImage] Delete error:", error)
    return false
  }

  return true
}

/**
 * Deletes multiple images from storage
 * Returns the count of successfully deleted images
 */
export async function deleteImages(urls: string[]): Promise<number> {
  let deleted = 0

  for (const url of urls) {
    const success = await deleteImage(url)
    if (success) deleted++
  }

  return deleted
}

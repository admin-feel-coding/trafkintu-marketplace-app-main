"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { uploadImage, type UploadError } from "@/shared/lib/storage"

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (urls: string[]) => void
  userId: string
  maxImages?: number
  disabled?: boolean
  className?: string
}

export function ImageUploader({
  images,
  onImagesChange,
  userId,
  maxImages = 5,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canAddMore = images.length < maxImages && !disabled && !isUploading

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !canAddMore) return

      setError(null)
      setIsUploading(true)
      setUploadProgress(0)

      const filesToUpload = Array.from(files).slice(0, maxImages - images.length)
      const newUrls: string[] = []

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        setUploadProgress(Math.round(((i + 0.5) / filesToUpload.length) * 100))

        const result = await uploadImage(file, userId, (p) => {
          const base = (i / filesToUpload.length) * 100
          const portion = (p / 100) * (100 / filesToUpload.length)
          setUploadProgress(Math.round(base + portion))
        })

        if ("url" in result) {
          newUrls.push(result.url)
        } else {
          setError((result as UploadError).message)
        }
      }

      if (newUrls.length > 0) {
        onImagesChange([...images, ...newUrls])
      }

      setIsUploading(false)
      setUploadProgress(0)

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    [canAddMore, images, maxImages, onImagesChange, userId]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (canAddMore) setIsDragging(true)
    },
    [canAddMore]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (canAddMore) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [canAddMore, handleFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
    },
    [images, onImagesChange]
  )

  const handleClick = useCallback(() => {
    if (canAddMore) {
      inputRef.current?.click()
    }
  }, [canAddMore])

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {images.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image src={url} alt={`Imagen ${index + 1}`} fill className="object-cover" sizes="150px" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                  aria-label="Eliminar imagen"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {canAddMore && (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Subiendo... {uploadProgress}%</span>
            </div>
          ) : (
            <>
              <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Agregar imágenes</span>
              <span className="text-xs text-muted-foreground">
                Arrastra o toca para seleccionar ({images.length}/{maxImages})
              </span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, PNG o WebP. Máx 5MB</span>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Max reached message */}
      {images.length >= maxImages && !disabled && (
        <p className="text-xs text-muted-foreground">Máximo de {maxImages} imágenes alcanzado</p>
      )}
    </div>
  )
}

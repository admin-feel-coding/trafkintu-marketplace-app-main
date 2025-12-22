"use client"

import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadImage, deleteImage, isStorageUrl, type UploadError } from "@/shared/lib/storage"

interface SingleImageUploaderProps {
  value: string
  onChange: (url: string) => void
  userId: string
  aspectRatio?: "banner" | "square"
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function SingleImageUploader({
  value,
  onChange,
  userId,
  aspectRatio = "square",
  disabled = false,
  className,
  placeholder = "Subir imagen",
}: SingleImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const aspectClass = aspectRatio === "banner" ? "aspect-[3/1]" : "aspect-square w-32"

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file || disabled || isUploading) return

      setError(null)
      setIsUploading(true)
      setUploadProgress(0)

      const result = await uploadImage(file, userId, setUploadProgress)

      if ("url" in result) {
        // Delete old image if it was from storage
        if (value && isStorageUrl(value)) {
          await deleteImage(value)
        }
        onChange(result.url)
      } else {
        setError((result as UploadError).message)
      }

      setIsUploading(false)
      setUploadProgress(0)

      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    [disabled, isUploading, onChange, userId, value]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && !isUploading) setIsDragging(true)
    },
    [disabled, isUploading]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (!disabled && !isUploading && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [disabled, isUploading, handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0] || null)
    },
    [handleFile]
  )

  const handleRemove = useCallback(async () => {
    if (value && isStorageUrl(value)) {
      await deleteImage(value)
    }
    onChange("")
  }, [value, onChange])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click()
    }
  }, [disabled, isUploading])

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className={cn("group relative overflow-hidden rounded-lg border bg-muted", aspectClass)}>
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes={aspectRatio === "banner" ? "100vw" : "128px"}
          />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleClick}
              >
                <ImagePlus className="h-4 w-4 mr-1" />
                Cambiar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            aspectClass,
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
            </div>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs text-muted-foreground">{placeholder}</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

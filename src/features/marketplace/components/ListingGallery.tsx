"use client"

import { useState } from "react"
import Image from "next/image"

interface ListingGalleryProps {
  images: string[]
  title: string
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Sin imagen</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <Image src={images[selectedImage] || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
              }`}
            >
              <Image src={image || "/placeholder.svg"} alt={`${title} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageUploader } from "@/shared/components/ImageUploader"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"

interface ListingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing?: Listing
  categories: Category[]
  userId: string
  onSubmit: (data: ListingFormData) => Promise<void>
}

export interface ListingFormData {
  title: string
  type: "product" | "service"
  categoryId: string
  description: string
  priceKind: "fixed" | "from" | "quote"
  priceAmount?: number
  images: string[]
}

export function ListingFormDialog({ open, onOpenChange, listing, categories, userId, onSubmit }: ListingFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    type: "product",
    categoryId: "",
    description: "",
    priceKind: "fixed",
    priceAmount: undefined,
    images: [],
  })

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        type: listing.type,
        categoryId: listing.categoryId,
        description: listing.description,
        priceKind: listing.price.kind,
        priceAmount: listing.price.amount,
        images: listing.images,
      })
    } else {
      setFormData({
        title: "",
        type: "product",
        categoryId: categories[0]?.id || "",
        description: "",
        priceKind: "fixed",
        priceAmount: undefined,
        images: [],
      })
    }
  }, [listing, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg md:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{listing ? "Editar publicación" : "Crear publicación"}</DialogTitle>
          <DialogDescription>
            {listing ? "Modifica la información de tu publicación" : "Completa los datos para publicar"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as ListingFormData["type"] })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Producto</SelectItem>
                  <SelectItem value="service">Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceKind">Tipo de precio</Label>
              <Select
                value={formData.priceKind}
                onValueChange={(v) => setFormData({ ...formData, priceKind: v as ListingFormData["priceKind"] })}
              >
                <SelectTrigger id="priceKind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Precio fijo</SelectItem>
                  <SelectItem value="from">Desde</SelectItem>
                  <SelectItem value="quote">A cotizar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.priceKind !== "quote" && (
              <div className="space-y-2">
                <Label htmlFor="priceAmount">Monto (CLP)</Label>
                  <Input
                    id="priceAmount"
                    type="number"
                    min="0"
                    value={formData.priceAmount || ""}
                    onChange={(e) => setFormData({ ...formData, priceAmount: Number(e.target.value) || undefined })}
                    required
                  />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Imágenes</Label>
            <ImageUploader
              images={formData.images}
              onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
              userId={userId}
              maxImages={5}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : listing ? "Guardar cambios" : "Crear publicación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

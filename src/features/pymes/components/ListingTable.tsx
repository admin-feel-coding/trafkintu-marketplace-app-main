"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Power, Star } from "lucide-react"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import { formatPriceDisplay } from "@/shared/lib/format"

interface ListingTableProps {
  listings: Listing[]
  categories: Category[]
  onEdit: (listing: Listing) => void
  onToggleActive: (listingId: string) => void
  onRequestFeatured: (listingId: string) => void
}

export function ListingTable({ listings, categories, onEdit, onToggleActive, onRequestFeatured }: ListingTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No tienes publicaciones aún
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => {
              const category = categories.find((c) => c.id === listing.categoryId)
              return (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {listing.title}
                      {listing.isFeatured && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Destacado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{category?.name || "-"}</TableCell>
                  <TableCell className="capitalize">{listing.type === "product" ? "Producto" : "Servicio"}</TableCell>
                  <TableCell>{formatPriceDisplay(listing.price)}</TableCell>
                  <TableCell>
                    <Badge variant={listing.isActive ? "default" : "secondary"}>
                      {listing.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(listing)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleActive(listing.id)}>
                          <Power className="h-4 w-4 mr-2" />
                          {listing.isActive ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                        {!listing.isFeatured && (
                          <DropdownMenuItem onClick={() => onRequestFeatured(listing.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Solicitar destacado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

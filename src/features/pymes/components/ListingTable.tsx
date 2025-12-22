"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Power, Star } from "lucide-react"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import { formatPriceDisplay } from "@/shared/lib/format"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileTableCard, CardRow, CardActions } from "@/shared/components/MobileTableCard"

interface ListingTableProps {
  listings: Listing[]
  categories: Category[]
  onEdit: (listing: Listing) => void
  onToggleActive: (listingId: string) => void
  onRequestFeatured: (listingId: string) => void
}

export function ListingTable({ listings, categories, onEdit, onToggleActive, onRequestFeatured }: ListingTableProps) {
  const isMobile = useIsMobile()

  // Empty state
  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No tienes publicaciones aún
        </CardContent>
      </Card>
    )
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {listings.map((listing) => {
          const category = categories.find((c) => c.id === listing.categoryId)
          return (
            <MobileTableCard key={listing.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="font-semibold text-base leading-tight">{listing.title}</h3>
                  {listing.isFeatured && (
                    <Badge variant="default" className="text-xs mt-1.5">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Destacado
                    </Badge>
                  )}
                </div>
                <Badge variant={listing.isActive ? "default" : "secondary"}>
                  {listing.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              <CardRow label="Categoría" value={category?.name || "-"} />
              <CardRow label="Tipo" value={listing.type === "product" ? "Producto" : "Servicio"} />
              <CardRow label="Precio" value={formatPriceDisplay(listing.price)} />
              <CardActions>
                <Button size="sm" variant="outline" onClick={() => onEdit(listing)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => onToggleActive(listing.id)} className="flex-1">
                  <Power className="h-4 w-4 mr-1" />
                  {listing.isActive ? "Desactivar" : "Activar"}
                </Button>
                {!listing.isFeatured && (
                  <Button size="sm" variant="outline" onClick={() => onRequestFeatured(listing.id)} className="flex-1">
                    <Star className="h-4 w-4 mr-1" /> Destacar
                  </Button>
                )}
              </CardActions>
            </MobileTableCard>
          )
        })}
      </div>
    )
  }

  // Desktop Table View
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
          {listings.map((listing) => {
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
          })}
        </TableBody>
      </Table>
    </div>
  )
}

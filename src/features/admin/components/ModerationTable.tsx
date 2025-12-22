"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Power, ExternalLink } from "lucide-react"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"
import { formatPriceDisplay } from "@/shared/lib/format"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileTableCard, CardRow, CardActions } from "@/shared/components/MobileTableCard"

interface ModerationTableProps {
  listings: Listing[]
  categories: Category[]
  pymes: Pyme[]
  onToggleActive: (listingId: string) => void
}

export function ModerationTable({ listings, categories, pymes, onToggleActive }: ModerationTableProps) {
  const isMobile = useIsMobile()

  // Empty state
  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay publicaciones
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
          const pyme = pymes.find((p) => p.id === listing.pymeId)
          return (
            <MobileTableCard key={listing.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base leading-tight">{listing.title}</h3>
                    <Link href={`/listing/${listing.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3 w-3" />
                        <span className="sr-only">Ver publicación</span>
                      </Button>
                    </Link>
                  </div>
                </div>
                <Badge variant={listing.isActive ? "default" : "secondary"}>
                  {listing.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              <CardRow label="PYME" value={pyme?.name || "-"} />
              <CardRow label="Categoría" value={category?.name || "-"} />
              <CardRow label="Precio" value={formatPriceDisplay(listing.price)} />
              <CardActions>
                <Button size="sm" variant="outline" onClick={() => onToggleActive(listing.id)} className="w-full">
                  <Power className="h-4 w-4 mr-1" />
                  {listing.isActive ? "Desactivar" : "Activar"}
                </Button>
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
            <TableHead>Publicación</TableHead>
            <TableHead>PYME</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => {
            const category = categories.find((c) => c.id === listing.categoryId)
            const pyme = pymes.find((p) => p.id === listing.pymeId)

            return (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {listing.title}
                    <Link href={`/listing/${listing.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3 w-3" />
                        <span className="sr-only">Ver publicación</span>
                      </Button>
                    </Link>
                  </div>
                </TableCell>
                <TableCell>{pyme?.name || "-"}</TableCell>
                <TableCell>{category?.name || "-"}</TableCell>
                <TableCell>{formatPriceDisplay(listing.price)}</TableCell>
                <TableCell>
                  <Badge variant={listing.isActive ? "default" : "secondary"}>
                    {listing.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onToggleActive(listing.id)}>
                    <Power className="h-4 w-4 mr-1" />
                    {listing.isActive ? "Desactivar" : "Activar"}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

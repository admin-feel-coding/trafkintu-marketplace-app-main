"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Power, ExternalLink } from "lucide-react"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"
import { formatPriceDisplay } from "@/shared/lib/format"
import Link from "next/link"

interface ModerationTableProps {
  listings: Listing[]
  categories: Category[]
  pymes: Pyme[]
  onToggleActive: (listingId: string) => void
}

export function ModerationTable({ listings, categories, pymes, onToggleActive }: ModerationTableProps) {
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
          {listings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No hay publicaciones
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => {
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
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

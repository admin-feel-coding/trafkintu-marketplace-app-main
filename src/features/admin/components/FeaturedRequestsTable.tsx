"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X } from "lucide-react"
import type { FeaturedRequest } from "@/domain/ports/AdminRepository"
import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"
import { formatDate } from "@/shared/lib/format"

interface FeaturedRequestsTableProps {
  requests: FeaturedRequest[]
  listings: Listing[]
  pymes: Pyme[]
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
}

export function FeaturedRequestsTable({ requests, listings, pymes, onApprove, onReject }: FeaturedRequestsTableProps) {
  const pendingRequests = requests.filter((r) => r.status === "pending")

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PYME</TableHead>
            <TableHead>Publicación</TableHead>
            <TableHead>Fecha Solicitud</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No hay solicitudes pendientes
              </TableCell>
            </TableRow>
          ) : (
            pendingRequests.map((request) => {
              const listing = listings.find((l) => l.id === request.listingId)
              const pyme = pymes.find((p) => p.id === request.pymeId)

              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{pyme?.name || "-"}</TableCell>
                  <TableCell>{listing?.title || "-"}</TableCell>
                  <TableCell>{formatDate(request.requestedAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "approved"
                          ? "default"
                          : request.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {request.status === "approved"
                        ? "Aprobada"
                        : request.status === "rejected"
                          ? "Rechazada"
                          : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => onApprove(request.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onReject(request.id)}>
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
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

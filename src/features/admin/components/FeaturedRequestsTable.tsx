"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import type { FeaturedRequest } from "@/domain/ports/AdminRepository"
import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"
import { formatDate, formatPrice } from "@/shared/lib/format"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileTableCard, CardRow, CardActions } from "@/shared/components/MobileTableCard"

interface FeaturedRequestsTableProps {
  requests: FeaturedRequest[]
  listings: Listing[]
  pymes: Pyme[]
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
}

export function FeaturedRequestsTable({ requests, listings, pymes, onApprove, onReject }: FeaturedRequestsTableProps) {
  const isMobile = useIsMobile()
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  )

  const getStatusLabel = (status: FeaturedRequest["status"]) => {
    if (status === "approved") return "Aprobada"
    if (status === "rejected") return "Rechazada"
    if (status === "expired") return "Expirada"
    return "Pendiente"
  }

  const getPaymentLabel = (status?: FeaturedRequest["paymentStatus"]) => {
    if (!status || status === "pending") return "Pendiente"
    if (status === "approved") return "Aprobado"
    if (status === "rejected") return "Rechazado"
    if (status === "in_process") return "En proceso"
    if (status === "cancelled") return "Cancelado"
    if (status === "refunded") return "Reembolsado"
    if (status === "charged_back") return "Contracargo"
    if (status === "expired") return "Expirado"
    return status
  }

  // Empty state
  if (sortedRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay solicitudes
        </CardContent>
      </Card>
    )
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {sortedRequests.map((request) => {
          const listing = listings.find((l) => l.id === request.listingId)
          const pyme = pymes.find((p) => p.id === request.pymeId)
          const planLabel = request.planDays ? `${request.planDays} dias` : "Sin plan"
          const planPrice = request.planPriceClp ? formatPrice(request.planPriceClp) : "-"
          return (
            <MobileTableCard key={request.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="font-semibold text-base leading-tight">{pyme?.name || "-"}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{listing?.title || "-"}</p>
                </div>
                <Badge
                  variant={
                    request.status === "approved"
                      ? "default"
                      : request.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
              <CardRow label="Fecha solicitud" value={formatDate(request.requestedAt)} />
              <CardRow label="Plan" value={`${planLabel} · ${planPrice}`} />
              <CardRow label="Pago" value={getPaymentLabel(request.paymentStatus)} />
              {request.featuredUntil && <CardRow label="Vence" value={formatDate(request.featuredUntil)} />}
              {request.status === "pending" && (
                <CardActions>
                  <Button size="sm" onClick={() => onApprove(request.id)} className="flex-1">
                    <Check className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onReject(request.id)} className="flex-1">
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </CardActions>
              )}
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
            <TableHead>PYME</TableHead>
            <TableHead>Publicación</TableHead>
            <TableHead>Fecha Solicitud</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Vence</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRequests.map((request) => {
            const listing = listings.find((l) => l.id === request.listingId)
            const pyme = pymes.find((p) => p.id === request.pymeId)
            const planLabel = request.planDays ? `${request.planDays} dias` : "Sin plan"
            const planPrice = request.planPriceClp ? formatPrice(request.planPriceClp) : "-"

            return (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{pyme?.name || "-"}</TableCell>
                <TableCell>{listing?.title || "-"}</TableCell>
                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                <TableCell>{`${planLabel} · ${planPrice}`}</TableCell>
                <TableCell>{getPaymentLabel(request.paymentStatus)}</TableCell>
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
                    {getStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>{request.featuredUntil ? formatDate(request.featuredUntil) : "-"}</TableCell>
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
          })}
        </TableBody>
      </Table>
    </div>
  )
}

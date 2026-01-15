"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X } from "lucide-react"
import type { Pyme } from "@/domain/entities/Pyme"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileTableCard, CardRow, CardActions } from "@/shared/components/MobileTableCard"

interface PymeVerificationTableProps {
  pymes: Pyme[]
  onApprove: (pymeId: string) => void
  onReject: (pymeId: string, note: string) => void
}

export function PymeVerificationTable({ pymes, onApprove, onReject }: PymeVerificationTableProps) {
  const isMobile = useIsMobile()
  const [notes, setNotes] = useState<Record<string, string>>({})

  const pendingPymes = useMemo(
    () => pymes.filter((pyme) => pyme.verificationStatus === "pending"),
    [pymes],
  )

  if (pendingPymes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay solicitudes de verificacion pendientes
        </CardContent>
      </Card>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {pendingPymes.map((pyme) => (
          <MobileTableCard key={pyme.id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-base leading-tight">{pyme.name}</h3>
              <Badge variant="secondary">En tramite</Badge>
            </div>
            <CardRow label="RUT" value={pyme.rut || "-"} />
            <CardRow
              label="Solicitado"
              value={pyme.verificationRequestedAt ? new Date(pyme.verificationRequestedAt).toLocaleDateString("es-CL") : "-"}
            />
            <div className="pt-2">
              <Input
                value={notes[pyme.id] || ""}
                onChange={(e) => setNotes({ ...notes, [pyme.id]: e.target.value })}
                placeholder="Comentario de rechazo"
              />
            </div>
            <CardActions>
              <Button size="sm" className="w-full" onClick={() => onApprove(pyme.id)}>
                <Check className="h-4 w-4 mr-1" />
                Aprobar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onReject(pyme.id, notes[pyme.id] || "")}
              >
                <X className="h-4 w-4 mr-1" />
                Rechazar
              </Button>
            </CardActions>
          </MobileTableCard>
        ))}
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PYME</TableHead>
            <TableHead>RUT</TableHead>
            <TableHead>Solicitado</TableHead>
            <TableHead>Comentario</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingPymes.map((pyme) => (
            <TableRow key={pyme.id}>
              <TableCell className="font-medium">{pyme.name}</TableCell>
              <TableCell>{pyme.rut || "-"}</TableCell>
              <TableCell>
                {pyme.verificationRequestedAt ? new Date(pyme.verificationRequestedAt).toLocaleDateString("es-CL") : "-"}
              </TableCell>
              <TableCell className="min-w-[220px]">
                <Input
                  value={notes[pyme.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [pyme.id]: e.target.value })}
                  placeholder="Comentario de rechazo"
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={() => onApprove(pyme.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onReject(pyme.id, notes[pyme.id] || "")}>
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

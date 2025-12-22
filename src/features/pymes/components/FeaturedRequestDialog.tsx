"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface FeaturedRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function FeaturedRequestDialog({ open, onOpenChange, onConfirm }: FeaturedRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Destacado</DialogTitle>
          <DialogDescription>Información importante sobre las publicaciones destacadas</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">¿Qué son las publicaciones destacadas?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Aparecen primero en los resultados</li>
                  <li>Incluyen una insignia especial</li>
                  <li>Mayor visibilidad en la página principal</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Proceso de solicitud:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Envía tu solicitud desde este panel</li>
              <li>El equipo de TRAFKINTU revisará tu solicitud</li>
              <li>Una vez aprobado, te contactaremos con instrucciones de pago</li>
              <li>Tu publicación se destacará inmediatamente después del pago</li>
            </ol>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              Enviar solicitud
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

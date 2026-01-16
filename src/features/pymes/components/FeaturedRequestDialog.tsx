"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle } from "lucide-react"
import type { FeaturedPlan } from "@/domain/entities/FeaturedPlan"
import { formatPrice } from "@/shared/lib/format"

interface FeaturedRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  plans: FeaturedPlan[]
  selectedPlanId: string | null
  onSelectPlan: (planId: string) => void
  isSubmitting?: boolean
}

export function FeaturedRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  plans,
  selectedPlanId,
  onSelectPlan,
  isSubmitting,
}: FeaturedRequestDialogProps) {
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Destacado</DialogTitle>
          <DialogDescription>Elige un plan y completa el pago con MercadoPago</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Que incluye el destacado</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Aparecen primero en los resultados</li>
                  <li>Incluyen una insignia especial</li>
                  <li>Mayor visibilidad en la pagina principal</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Selecciona un plan:</p>
            {plans.length === 0 ? (
              <p className="text-muted-foreground">No hay planes disponibles por ahora.</p>
            ) : (
              <RadioGroup
                className="space-y-2"
                value={selectedPlanId || undefined}
                onValueChange={(value) => onSelectPlan(value)}
              >
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer"
                  >
                    <RadioGroupItem value={plan.id} />
                    <span className="flex-1">
                      <span className="block font-semibold">{plan.name}</span>
                      <span className="text-muted-foreground">
                        {plan.days} dias · {formatPrice(plan.priceClp)}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            )}
            {selectedPlan && (
              <p className="text-xs text-muted-foreground">
                Se activara por {selectedPlan.days} dias luego del pago aprobado.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!selectedPlanId || isSubmitting}
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {isSubmitting ? "Redirigiendo..." : "Pagar con MercadoPago"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

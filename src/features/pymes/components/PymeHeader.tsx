import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Truck } from "lucide-react"
import type { Pyme } from "@/domain/entities/Pyme"

interface PymeHeaderProps {
  pyme: Pyme
}

export function PymeHeader({ pyme }: PymeHeaderProps) {
  const fulfillmentLabels: Record<Pyme["fulfillment"], string> = {
    local: "Retiro local",
    delivery: "Despacho a domicilio",
    both: "Retiro y despacho",
  }

  return (
    <div className="flex items-start gap-4 mb-6">
      <Avatar className="h-20 w-20">
        {pyme.avatarUrl && <AvatarImage src={pyme.avatarUrl || "/placeholder.svg"} alt={pyme.name} />}
        <AvatarFallback className="text-2xl">{pyme.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2">{pyme.name}</h1>
        <p className="text-muted-foreground mb-3">{pyme.description}</p>

        <div className="flex flex-wrap gap-3 text-sm">
          {pyme.address && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{pyme.address}</span>
            </div>
          )}

          {pyme.hours && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{pyme.hours}</span>
            </div>
          )}

          <Badge variant="secondary">
            <Truck className="h-3 w-3 mr-1" />
            {fulfillmentLabels[pyme.fulfillment]}
          </Badge>
        </div>
      </div>
    </div>
  )
}

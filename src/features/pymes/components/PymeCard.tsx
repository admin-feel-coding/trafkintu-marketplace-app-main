import Link from "next/link"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight, BadgeCheck } from "lucide-react"
import type { Pyme } from "@/domain/entities/Pyme"

interface PymeCardProps {
  pyme: Pyme
}

export function PymeCard({ pyme }: PymeCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {pyme.avatarUrl && <AvatarImage src={pyme.avatarUrl || "/placeholder.svg"} alt={pyme.name} />}
            <AvatarFallback>{pyme.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-lg">{pyme.name}</h3>
              {pyme.verificationStatus === "verified" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  <BadgeCheck className="h-3 w-3" />
                  Verificada
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{pyme.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full bg-transparent">
          <Link href={`/pyme/${pyme.id}`}>
            Ver perfil completo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

import Link from "next/link"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
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
            <h3 className="font-semibold text-lg">{pyme.name}</h3>
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

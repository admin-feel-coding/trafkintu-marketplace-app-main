import { Card, CardContent } from "@/components/ui/card"
import { Package, Users, Star, AlertCircle } from "lucide-react"

interface AdminStatsProps {
  totalListings: number
  totalPymes: number
  featuredListings: number
  pendingRequests: number
}

export function AdminStats({ totalListings, totalPymes, featuredListings, pendingRequests }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Publicaciones</p>
              <p className="text-xl md:text-2xl font-bold">{totalListings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-secondary/10 rounded-lg">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">PYMEs</p>
              <p className="text-xl md:text-2xl font-bold">{totalPymes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
              <Star className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Destacadas</p>
              <p className="text-xl md:text-2xl font-bold">{featuredListings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Pendientes</p>
              <p className="text-xl md:text-2xl font-bold">{pendingRequests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

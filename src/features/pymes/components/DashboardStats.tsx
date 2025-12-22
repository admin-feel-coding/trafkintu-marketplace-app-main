import { Card, CardContent } from "@/components/ui/card"
import { Package, Eye, Star } from "lucide-react"

interface DashboardStatsProps {
  totalListings: number
  activeListings: number
  featuredListings: number
}

export function DashboardStats({ totalListings, activeListings, featuredListings }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Total Publicaciones</p>
              <p className="text-xl md:text-2xl font-bold">{totalListings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-secondary/10 rounded-lg">
              <Eye className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Activas</p>
              <p className="text-xl md:text-2xl font-bold">{activeListings}</p>
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
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"
import { formatPriceDisplay } from "@/shared/lib/format"
import { Star } from "lucide-react"

interface ListingCardProps {
  listing: Listing
  category?: Category
  pyme?: Pyme
}

export function ListingCard({ listing, category, pyme }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col pt-0 gap-0">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {listing.images[0] && (
            <Image
              src={listing.images[0] || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {listing.isFeatured && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Destacado
            </Badge>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            {category && (
              <Badge variant="secondary" className="text-xs mb-2">
                {category.name}
              </Badge>
            )}
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">{listing.title}</h3>
          </div>
          <p className="text-xl font-bold text-primary mb-2">{formatPriceDisplay(listing.price)}</p>
          {pyme && <p className="text-sm text-muted-foreground mb-3">{pyme.name}</p>}
          <Button className="w-full mt-auto bg-transparent" variant="outline">
            Ver detalles
          </Button>
        </div>
      </Card>
    </Link>
  )
}

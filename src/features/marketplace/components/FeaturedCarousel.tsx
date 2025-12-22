"use client"

import { ListingCard } from "./ListingCard"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"

interface FeaturedCarouselProps {
  listings: Listing[]
  categories: Category[]
  pymes: Pyme[]
}

export function FeaturedCarousel({ listings, categories, pymes }: FeaturedCarouselProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4">
      <div className="flex gap-3 md:gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <div key={listing.id} className="min-w-[260px] sm:min-w-[280px] md:min-w-0">
            <ListingCard
              listing={listing}
              category={categories.find((c) => c.id === listing.categoryId)}
              pyme={pymes.find((p) => p.id === listing.pymeId)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

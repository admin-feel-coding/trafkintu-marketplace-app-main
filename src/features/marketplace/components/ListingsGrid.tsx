import { ListingCard } from "./ListingCard"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"

interface ListingsGridProps {
  listings: Listing[]
  categories: Category[]
  pymes: Pyme[]
}

export function ListingsGrid({ listings, categories, pymes }: ListingsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          category={categories.find((c) => c.id === listing.categoryId)}
          pyme={pymes.find((p) => p.id === listing.pymeId)}
        />
      ))}
    </div>
  )
}

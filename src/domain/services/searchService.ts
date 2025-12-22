import type { Listing } from "../entities/Listing"
import type { Category } from "../entities/Category"
import type { Pyme } from "../entities/Pyme"

export function searchListings(listings: Listing[], query: string, categories: Category[], pymes: Pyme[]): Listing[] {
  if (!query.trim()) return listings

  const lowerQuery = query.toLowerCase()

  return listings.filter((listing) => {
    const category = categories.find((c) => c.id === listing.categoryId)
    const pyme = pymes.find((p) => p.id === listing.pymeId)

    return (
      listing.title.toLowerCase().includes(lowerQuery) ||
      listing.description.toLowerCase().includes(lowerQuery) ||
      category?.name.toLowerCase().includes(lowerQuery) ||
      pyme?.name.toLowerCase().includes(lowerQuery)
    )
  })
}

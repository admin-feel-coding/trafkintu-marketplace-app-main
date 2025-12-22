import type { Listing } from "../entities/Listing"

export function rankListings(listings: Listing[]): Listing[] {
  return [...listings].sort((a, b) => {
    // Featured first
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1

    // Then by date (most recent first)
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

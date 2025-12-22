import { marketplaceRepository } from "@/data/repositories/marketplace"
import { rankListings } from "@/domain/services/rankingService"

export async function getFeaturedListings() {
  const listings = await marketplaceRepository.getListings({
    isActive: true,
    isFeatured: true,
  })
  return rankListings(listings)
}

export async function getRecentListings(limit?: number) {
  const listings = await marketplaceRepository.getListings({ isActive: true })
  const ranked = rankListings(listings)
  return limit ? ranked.slice(0, limit) : ranked
}

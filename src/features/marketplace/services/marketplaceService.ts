import { marketplaceMockRepository } from "@/data/repositories/MarketplaceMockRepository"
import { rankListings } from "@/domain/services/rankingService"

export async function getFeaturedListings() {
  const listings = await marketplaceMockRepository.getListings({
    isActive: true,
    isFeatured: true,
  })
  return rankListings(listings)
}

export async function getRecentListings(limit?: number) {
  const listings = await marketplaceMockRepository.getListings({ isActive: true })
  const ranked = rankListings(listings)
  return limit ? ranked.slice(0, limit) : ranked
}

import type { Listing } from "../entities/Listing"
import type { Category } from "../entities/Category"

export interface MarketplaceRepository {
  getListings(filters?: ListingFilters): Promise<Listing[]>
  getListingById(id: string): Promise<Listing | null>
  getCategories(): Promise<Category[]>
}

export interface ListingFilters {
  categoryId?: string
  type?: "product" | "service"
  searchQuery?: string
  isActive?: boolean
  isFeatured?: boolean
}

export interface MarketplaceFilters {
  categorySlug?: string
  type?: "product" | "service"
  searchQuery?: string
  isFeatured?: boolean
}

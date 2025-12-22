import type { MarketplaceRepository, ListingFilters } from "@/domain/ports/MarketplaceRepository"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import { supabaseBrowser } from "@/shared/lib/supabase/browser"
import { mapListing, mapCategory } from "./mappers"
import { mockListings, mockCategories } from "@/data/mock/seed"

export class MarketplaceSupabaseRepository implements MarketplaceRepository {
  async getListings(filters?: ListingFilters): Promise<Listing[]> {
    const supabase = supabaseBrowser()
    if (!supabase) {
      return mockListings
    }
    let query = supabase.from("listings").select("*, listing_images(url, sort_order)")

    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive)
    }
    if (filters?.isFeatured !== undefined) {
      query = query.eq("is_featured", filters.isFeatured)
    }
    if (filters?.categoryId) {
      query = query.eq("category_id", filters.categoryId)
    }
    if (filters?.type) {
      query = query.eq("type", filters.type)
    }
    if (filters?.searchQuery) {
      query = query.or(
        [
          `title.ilike.%${filters.searchQuery}%`,
          `description.ilike.%${filters.searchQuery}%`,
          `category_name.ilike.%${filters.searchQuery}%`,
          `pyme_name.ilike.%${filters.searchQuery}%`,
        ].join(","),
      )
    }

    query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false })

    const { data, error } = await query
    if (error || !data) return []
    return data.map(mapListing)
  }

  async getListingById(id: string): Promise<Listing | null> {
    const supabase = supabaseBrowser()
    if (!supabase) {
      return mockListings.find((l) => l.id === id) || null
    }
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("id", id)
      .maybeSingle()
    if (error || !data) return null
    return mapListing(data)
  }

  async getCategories(): Promise<Category[]> {
    const supabase = supabaseBrowser()
    if (!supabase) {
      return mockCategories
    }
    const { data, error } = await supabase.from("categories").select("*")
    if (error || !data) return []
    return data.map(mapCategory)
  }
}

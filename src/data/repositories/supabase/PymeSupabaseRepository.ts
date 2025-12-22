import type { PymeRepository, CreateListingData, UpdatePymeData } from "@/domain/ports/PymeRepository"
import type { Pyme } from "@/domain/entities/Pyme"
import type { Listing } from "@/domain/entities/Listing"
import { supabaseBrowser } from "@/shared/lib/supabase/browser"
import { mapListing, mapPyme } from "./mappers"
import { mockListings, mockPymes } from "@/data/mock/seed"

export class PymeSupabaseRepository implements PymeRepository {
  async getPymeById(id: string): Promise<Pyme | null> {
    const supabase = supabaseBrowser()
    if (!supabase) {
      return mockPymes.find((p) => p.id === id) || null
    }
    const { data, error } = await supabase.from("pymes").select("*").eq("id", id).maybeSingle()
    if (error || !data) return null
    return mapPyme(data)
  }

  async getListingsByPymeId(pymeId: string): Promise<Listing[]> {
    const supabase = supabaseBrowser()
    if (!supabase) {
      return mockListings.filter((l) => l.pymeId === pymeId)
    }
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("pyme_id", pymeId)
    if (error || !data) return []
    return data.map(mapListing)
  }

  async createListing(pymeId: string, data: CreateListingData): Promise<Listing> {
    const supabase = supabaseBrowser()
    if (!supabase) throw new Error("Supabase no configurado")
    const { data: inserted, error } = await supabase
      .from("listings")
      .insert({
        pyme_id: pymeId,
        type: data.type,
        category_id: data.categoryId,
        title: data.title,
        description: data.description,
        price: data.price,
        is_active: true,
        is_featured: false,
      })
      .select("*")
      .maybeSingle()

    if (error || !inserted) {
      throw new Error("Error creating listing")
    }

    if (data.images?.length) {
      const imagesPayload = data.images.map((url, idx) => ({
        listing_id: inserted.id,
        url,
        sort_order: idx + 1,
      }))
      await supabase.from("listing_images").insert(imagesPayload)
    }

    const { data: withImages } = await supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("id", inserted.id)
      .maybeSingle()

    return mapListing(withImages || inserted)
  }

  async updateListing(listingId: string, data: Partial<CreateListingData>): Promise<Listing> {
    const supabase = supabaseBrowser()
    if (!supabase) throw new Error("Supabase no configurado")
    const { data: updated, error } = await supabase
      .from("listings")
      .update({
        type: data.type,
        category_id: data.categoryId,
        title: data.title,
        description: data.description,
        price: data.price,
      })
      .eq("id", listingId)
      .select("*")
      .maybeSingle()

    if (error || !updated) {
      throw new Error("Error updating listing")
    }

    if (data.images) {
      await supabase.from("listing_images").delete().eq("listing_id", listingId)
      if (data.images.length) {
        await supabase.from("listing_images").insert(
          data.images.map((url, idx) => ({
            listing_id: listingId,
            url,
            sort_order: idx + 1,
          })),
        )
      }
    }

    const { data: withImages } = await supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("id", listingId)
      .maybeSingle()

    return mapListing(withImages || updated)
  }

  async toggleListingActive(listingId: string): Promise<Listing> {
    const supabase = supabaseBrowser()
    if (!supabase) throw new Error("Supabase no configurado")
    const { data: existing } = await supabase.from("listings").select("*").eq("id", listingId).maybeSingle()
    if (!existing) throw new Error("Listing not found")

    const { data: updated, error } = await supabase
      .from("listings")
      .update({ is_active: !existing.is_active })
      .eq("id", listingId)
      .select("*")
      .maybeSingle()

    if (error || !updated) throw new Error("Error toggling active")
    const { data: withImages } = await supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("id", listingId)
      .maybeSingle()

    return mapListing(withImages || updated)
  }

  async requestFeatured(listingId: string): Promise<void> {
    const supabase = supabaseBrowser()
    if (!supabase) throw new Error("Supabase no configurado")
    const { data: existing } = await supabase.from("listings").select("pyme_id").eq("id", listingId).maybeSingle()
    if (!existing) throw new Error("Listing not found")

    const { data: pending } = await supabase
      .from("featured_requests")
      .select("id")
      .eq("listing_id", listingId)
      .eq("status", "pending")
      .maybeSingle()
    if (pending) return

    const { error } = await supabase.from("featured_requests").insert({
      listing_id: listingId,
      pyme_id: existing.pyme_id,
      status: "pending",
    })
    if (error) throw new Error("Error requesting featured")
  }

  async updatePyme(pymeId: string, data: Partial<UpdatePymeData>): Promise<Pyme | null> {
    const supabase = supabaseBrowser()
    if (!supabase) throw new Error("Supabase no configurado")
    const { data: updated, error } = await supabase
      .from("pymes")
      .update({
        name: data.name,
        description: data.description,
        whatsapp: data.whatsapp,
        email: data.email,
        phone: data.phone,
        address: data.address,
        hours: data.hours,
        website: data.website,
        avatar_url: (data as any).avatarUrl,
        banner_url: (data as any).bannerUrl,
      })
      .eq("id", pymeId)
      .select("*")
      .maybeSingle()

    if (error || !updated) return null
    return mapPyme(updated)
  }
}

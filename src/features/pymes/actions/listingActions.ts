"use server"

import type { Listing } from "@/domain/entities/Listing"
import { supabaseAdmin } from "@/shared/lib/supabase/admin"
import { mapListing } from "@/data/repositories/supabase/mappers"


export async function getMyListingsAction(pymeId: string): Promise<Listing[]> {
  const supabase = supabaseAdmin()
  if (!supabase) return []

  const { data, error } = await supabase
    
    .from("listings")
    .select("*, listing_images(url, sort_order)")
    .eq("pyme_id", pymeId)

  if (error || !data) return []
  return data.map(mapListing)
}

export async function createListingAction(data: {
  pymeId: string
  title: string
  type: "product" | "service"
  categoryId: string
  description: string
  price: { kind: "fixed" | "from" | "quote"; amount?: number }
  images: string[]
  isActive: boolean
  isFeatured: boolean
}): Promise<Listing> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: inserted, error } = await supabase
    
    .from("listings")
    .insert({
      pyme_id: data.pymeId,
      type: data.type,
      category_id: data.categoryId,
      title: data.title,
      description: data.description,
      price_kind: data.price.kind,
      price_amount: data.price.amount || null,
      is_active: data.isActive,
      is_featured: data.isFeatured,
    })
    .select("*")
    .maybeSingle()

  if (error || !inserted) {
    console.error("[createListingAction] Error:", error)
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

export async function updateListingAction(
  id: string,
  data: Partial<{
    title: string
    type: "product" | "service"
    categoryId: string
    description: string
    price: { kind: "fixed" | "from" | "quote"; amount?: number }
    images: string[]
  }>
): Promise<Listing> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: updated, error } = await supabase
    
    .from("listings")
    .update({
      type: data.type,
      category_id: data.categoryId,
      title: data.title,
      description: data.description,
      price_kind: data.price?.kind,
      price_amount: data.price?.amount || null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle()

  if (error || !updated) {
    console.error("[updateListingAction] Error:", error)
    throw new Error("Error updating listing")
  }

  if (data.images) {
    await supabase.from("listing_images").delete().eq("listing_id", id)
    if (data.images.length) {
      await supabase.from("listing_images").insert(
        data.images.map((url, idx) => ({
          listing_id: id,
          url,
          sort_order: idx + 1,
        }))
      )
    }
  }

  const { data: withImages } = await supabase
    
    .from("listings")
    .select("*, listing_images(url, sort_order)")
    .eq("id", id)
    .maybeSingle()

  return mapListing(withImages || updated)
}

export async function toggleActiveAction(id: string): Promise<Listing> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: listing, error: fetchError } = await supabase
    
    .from("listings")
    .select("is_active")
    .eq("id", id)
    .maybeSingle()

  if (fetchError || !listing) throw new Error("Listing not found")

  const { data: updated, error } = await supabase
    
    .from("listings")
    .update({ is_active: !listing.is_active })
    .eq("id", id)
    .select("*, listing_images(url, sort_order)")
    .maybeSingle()

  if (error || !updated) throw new Error("Error toggling active")

  return mapListing(updated)
}

export async function requestFeaturedAction(listingId: string): Promise<void> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: listing } = await supabase
    
    .from("listings")
    .select("pyme_id")
    .eq("id", listingId)
    .maybeSingle()

  if (!listing) throw new Error("Listing not found")

  // Check if already has pending request
  const { data: pending } = await supabase
    
    .from("featured_requests")
    .select("id")
    .eq("listing_id", listingId)
    .eq("status", "pending")
    .maybeSingle()

  if (pending) return // Already has pending request

  const { error } = await supabase.from("featured_requests").insert({
    listing_id: listingId,
    pyme_id: listing.pyme_id,
    status: "pending",
  })

  if (error) throw new Error("Error requesting featured")
}

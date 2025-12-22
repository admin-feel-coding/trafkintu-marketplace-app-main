"use server"

import type { FeaturedRequest } from "@/domain/ports/AdminRepository"
import { supabaseAdmin } from "@/shared/lib/supabase/admin"


export async function getFeaturedRequestsAction(): Promise<FeaturedRequest[]> {
  const supabase = supabaseAdmin()
  if (!supabase) return []

  const { data, error } = await supabase
    
    .from("featured_requests")
    .select("*")
    .order("requested_at", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    listingId: row.listing_id,
    pymeId: row.pyme_id,
    requestedAt: row.requested_at,
    status: row.status,
  }))
}

export async function approveFeaturedRequestAction(requestId: string): Promise<void> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  // Get the request to find listing_id
  const { data: request } = await supabase
    
    .from("featured_requests")
    .select("listing_id")
    .eq("id", requestId)
    .maybeSingle()

  if (!request) throw new Error("Request not found")

  // Update request status
  await supabase
    
    .from("featured_requests")
    .update({ status: "approved" })
    .eq("id", requestId)

  // Update listing to be featured
  await supabase
    
    .from("listings")
    .update({ is_featured: true })
    .eq("id", request.listing_id)
}

export async function rejectFeaturedRequestAction(requestId: string): Promise<void> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  await supabase
    
    .from("featured_requests")
    .update({ status: "rejected" })
    .eq("id", requestId)
}

export async function toggleListingActiveAction(listingId: string): Promise<void> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: listing } = await supabase
    
    .from("listings")
    .select("is_active")
    .eq("id", listingId)
    .maybeSingle()

  if (!listing) throw new Error("Listing not found")

  await supabase
    
    .from("listings")
    .update({ is_active: !listing.is_active })
    .eq("id", listingId)
}

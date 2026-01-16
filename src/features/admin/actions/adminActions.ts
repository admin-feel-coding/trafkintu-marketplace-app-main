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
    requestedAt: new Date(row.requested_at),
    status: row.status,
    planId: row.plan_id,
    planDays: row.plan_days,
    planPriceClp: row.plan_price_clp,
    paymentStatus: row.payment_status,
    paymentProvider: row.payment_provider,
    paymentProviderId: row.payment_provider_id,
    paymentPreferenceId: row.payment_preference_id,
    paymentInitPoint: row.payment_init_point,
    featuredAt: row.featured_at ? new Date(row.featured_at) : null,
    featuredUntil: row.featured_until ? new Date(row.featured_until) : null,
  }))
}

export async function approveFeaturedRequestAction(requestId: string): Promise<void> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  // Get the request to find listing_id
  const { data: request } = await supabase
    
    .from("featured_requests")
    .select("listing_id, plan_days")
    .eq("id", requestId)
    .maybeSingle()

  if (!request) throw new Error("Request not found")

  const now = new Date()
  const featuredUntil = request.plan_days ? new Date(now.getTime() + request.plan_days * 24 * 60 * 60 * 1000) : null

  // Update request status
  await supabase
    
    .from("featured_requests")
    .update({
      status: "approved",
      payment_status: "approved",
      featured_at: now.toISOString(),
      featured_until: featuredUntil?.toISOString() || null,
    })
    .eq("id", requestId)

  // Update listing to be featured
  await supabase
    
    .from("listings")
    .update({
      is_featured: true,
      featured_at: now.toISOString(),
      featured_until: featuredUntil?.toISOString() || null,
    })
    .eq("id", request.listing_id)
}

export async function rejectFeaturedRequestAction(requestId: string): Promise<void> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  await supabase
    
    .from("featured_requests")
    .update({ status: "rejected", payment_status: "rejected" })
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

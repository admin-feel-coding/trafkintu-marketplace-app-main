import type { AdminRepository, FeaturedRequest } from "@/domain/ports/AdminRepository"
import { supabaseAdmin } from "@/shared/lib/supabase/admin"
import { supabaseBrowser } from "@/shared/lib/supabase/browser"

type FeaturedRequestRow = {
  id: string
  listing_id: string
  pyme_id: string
  requested_at: string
  status: FeaturedRequest["status"]
  plan_id: string | null
  plan_days: number | null
  plan_price_clp: number | null
  payment_status: FeaturedRequest["paymentStatus"] | null
  payment_provider: string | null
  payment_provider_id: string | null
  payment_preference_id: string | null
  payment_init_point: string | null
  featured_at: string | null
  featured_until: string | null
}

export class AdminSupabaseRepository implements AdminRepository {
  async getFeaturedRequests() {
    const supabase = supabaseBrowser()
    if (!supabase) return []
    const { data, error } = await supabase.from("featured_requests").select("*")
    if (error || !data) return []
    return (data as FeaturedRequestRow[]).map((r) => ({
      id: r.id,
      listingId: r.listing_id,
      pymeId: r.pyme_id,
      requestedAt: new Date(r.requested_at),
      status: r.status,
      planId: r.plan_id,
      planDays: r.plan_days,
      planPriceClp: r.plan_price_clp,
      paymentStatus: r.payment_status ?? undefined,
      paymentProvider: r.payment_provider,
      paymentProviderId: r.payment_provider_id,
      paymentPreferenceId: r.payment_preference_id,
      paymentInitPoint: r.payment_init_point,
      featuredAt: r.featured_at ? new Date(r.featured_at) : null,
      featuredUntil: r.featured_until ? new Date(r.featured_until) : null,
    }))
  }

  async approveFeaturedRequest(requestId: string): Promise<void> {
    const admin = supabaseAdmin()
    if (!admin) throw new Error("Supabase admin no configurado")
    const { data: request, error } = await admin
      .from("featured_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle()
    if (error || !request) throw new Error("Request not found")

    const { error: updateListing } = await admin
      .from("listings")
      .update({ is_featured: true })
      .eq("id", request.listing_id)
    if (updateListing) throw new Error("Failed to update listing")

    await admin.from("featured_requests").update({ status: "approved" }).eq("id", requestId)
  }

  async rejectFeaturedRequest(requestId: string): Promise<void> {
    const admin = supabaseAdmin()
    if (!admin) throw new Error("Supabase admin no configurado")
    const { error } = await admin
      .from("featured_requests")
      .update({ status: "rejected" })
      .eq("id", requestId)
    if (error) throw new Error("Failed to reject")
  }

  async toggleListingActive(listingId: string): Promise<void> {
    const admin = supabaseAdmin()
    if (!admin) throw new Error("Supabase admin no configurado")
    const { data: listing, error } = await admin
      .from("listings")
      .select("is_active")
      .eq("id", listingId)
      .maybeSingle()
    if (error || !listing) throw new Error("Listing not found")
    const { error: update } = await admin
      .from("listings")
      .update({ is_active: !listing.is_active })
      .eq("id", listingId)
    if (update) throw new Error("Failed to toggle active")
  }
}

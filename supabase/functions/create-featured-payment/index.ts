/// <reference lib="deno.ns" />
import { createClient } from "@supabase/supabase-js"

type CreateFeaturedPaymentBody = {
  listingId: string
  planId: string
  returnBaseUrl: string
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") || ""

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Supabase env not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: "MercadoPago access token missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const authHeader = req.headers.get("Authorization") || ""
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  })
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const {
    data: { user },
    error: userError,
  } = await supabaseUser.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const body = (await req.json()) as CreateFeaturedPaymentBody
  const listingId = body?.listingId?.trim()
  const planId = body?.planId?.trim()
  const returnBaseUrl = body?.returnBaseUrl?.trim().replace(/\/$/, "")

  if (!listingId || !planId || !returnBaseUrl) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const { data: pyme, error: pymeError } = await admin
    .from("pymes")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (pymeError || !pyme) {
    return new Response(JSON.stringify({ error: "Pyme not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const { data: listing, error: listingError } = await admin
    .from("listings")
    .select("id, title, pyme_id, is_featured, featured_until")
    .eq("id", listingId)
    .eq("pyme_id", pyme.id)
    .maybeSingle()

  if (listingError || !listing) {
    return new Response(JSON.stringify({ error: "Listing not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (listing.is_featured) {
    return new Response(JSON.stringify({ error: "Listing already featured" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const { data: plan, error: planError } = await admin
    .from("featured_plans")
    .select("id, name, days, price_clp, is_active")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle()

  if (planError || !plan) {
    return new Response(JSON.stringify({ error: "Plan not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const { data: existingRequest } = await admin
    .from("featured_requests")
    .select("id, status, payment_status, payment_init_point, featured_until")
    .eq("listing_id", listingId)
    .in("status", ["pending", "approved"])
    .order("requested_at", { ascending: false })
    .maybeSingle()

  if (existingRequest?.status === "approved") {
    return new Response(JSON.stringify({ error: "Listing already featured" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (existingRequest?.status === "pending" && existingRequest.payment_init_point) {
    return new Response(JSON.stringify({ initPoint: existingRequest.payment_init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const { data: request, error: requestError } = await admin
    .from("featured_requests")
    .insert({
      listing_id: listingId,
      pyme_id: pyme.id,
      status: "pending",
      plan_id: plan.id,
      plan_days: plan.days,
      plan_price_clp: plan.price_clp,
      payment_status: "pending",
      payment_provider: "mercadopago",
    })
    .select("*")
    .maybeSingle()

  if (requestError || !request) {
    return new Response(JSON.stringify({ error: "Failed to create request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const preferenceBody = {
    items: [
      {
        title: `Destacado ${plan.days} dias - ${listing.title}`,
        quantity: 1,
        currency_id: "CLP",
        unit_price: Number(plan.price_clp),
      },
    ],
    external_reference: request.id,
    notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook?source_news=webhooks`,
    back_urls: {
      success: `${returnBaseUrl}/dashboard?payment=success&requestId=${request.id}`,
      pending: `${returnBaseUrl}/dashboard?payment=pending&requestId=${request.id}`,
      failure: `${returnBaseUrl}/dashboard?payment=failure&requestId=${request.id}`,
    },
    auto_return: "approved",
    metadata: {
      listingId,
      planId,
      pymeId: pyme.id,
    },
  }

  const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(preferenceBody),
  })

  const preference = await preferenceResponse.json()
  if (!preferenceResponse.ok || !preference?.init_point) {
    return new Response(JSON.stringify({ error: "Failed to create preference", details: preference }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  await admin
    .from("featured_requests")
    .update({
      payment_preference_id: preference.id,
      payment_init_point: preference.init_point,
    })
    .eq("id", request.id)

  return new Response(JSON.stringify({ initPoint: preference.init_point }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
})

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") || ""
const MERCADOPAGO_WEBHOOK_SECRET = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET") || ""

const jsonHeaders = { "Content-Type": "application/json" }

type MercadoPagoPayment = {
  id: number
  status: string
  external_reference?: string | null
}

function parseSignature(signature: string | null) {
  if (!signature) return { ts: "", hash: "" }
  const parts = signature.split(",")
  let ts = ""
  let hash = ""
  for (const part of parts) {
    const [key, value] = part.split("=").map((item) => item.trim())
    if (key === "ts") ts = value
    if (key === "v1") hash = value
  }
  return { ts, hash }
}

async function hmacSha256Hex(secret: string, message: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MERCADOPAGO_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: "Env not configured" }), { status: 500, headers: jsonHeaders })
  }

  const url = new URL(req.url)
  let dataId = url.searchParams.get("data.id")
  const requestId = req.headers.get("x-request-id") || ""
  const signatureHeader = req.headers.get("x-signature")

  if (!dataId) {
    try {
      const body = await req.json()
      dataId = body?.data?.id?.toString() || body?.id?.toString() || null
    } catch {
      dataId = null
    }
  }

  if (MERCADOPAGO_WEBHOOK_SECRET) {
    const { ts, hash } = parseSignature(signatureHeader)
    if (!dataId || !ts || !hash) {
      return new Response(JSON.stringify({ error: "Invalid signature headers" }), { status: 401, headers: jsonHeaders })
    }
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
    const computed = await hmacSha256Hex(MERCADOPAGO_WEBHOOK_SECRET, manifest)
    if (computed !== hash) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: jsonHeaders })
    }
  }

  if (!dataId) {
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders })
  }

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
    headers: {
      Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
    },
  })

  const payment = (await paymentResponse.json()) as MercadoPagoPayment
  if (!paymentResponse.ok || !payment?.id) {
    return new Response(JSON.stringify({ error: "Payment lookup failed" }), { status: 400, headers: jsonHeaders })
  }

  const externalReference = payment.external_reference?.toString() || ""
  if (!externalReference) {
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const { data: request } = await admin
    .from("featured_requests")
    .select("id, listing_id, plan_days, featured_at, featured_until")
    .eq("id", externalReference)
    .maybeSingle()

  if (!request) {
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders })
  }

  const paymentStatus = payment.status
  const now = new Date()
  const planDays = request.plan_days ? Number(request.plan_days) : 0
  const featuredUntil = planDays ? new Date(now.getTime() + planDays * 24 * 60 * 60 * 1000) : null

  const requestUpdates: Record<string, string | null> = {
    payment_status: paymentStatus,
    payment_provider: "mercadopago",
    payment_provider_id: payment.id.toString(),
  }

  let shouldFeature = false
  let shouldUnfeature = false

  if (paymentStatus === "approved") {
    shouldFeature = true
    requestUpdates.status = "approved"
    requestUpdates.featured_at = now.toISOString()
    requestUpdates.featured_until = featuredUntil ? featuredUntil.toISOString() : null
  } else if (paymentStatus === "refunded" || paymentStatus === "charged_back") {
    shouldUnfeature = true
    requestUpdates.status = "expired"
    requestUpdates.featured_until = now.toISOString()
  } else if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
    requestUpdates.status = "rejected"
  } else {
    requestUpdates.status = "pending"
  }

  await admin.from("featured_requests").update(requestUpdates).eq("id", request.id)

  if (shouldFeature) {
    await admin
      .from("listings")
      .update({
        is_featured: true,
        featured_at: now.toISOString(),
        featured_until: featuredUntil ? featuredUntil.toISOString() : null,
      })
      .eq("id", request.listing_id)
  }

  if (shouldUnfeature) {
    await admin
      .from("listings")
      .update({
        is_featured: false,
        featured_at: null,
        featured_until: null,
      })
      .eq("id", request.listing_id)
  }

  return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders })
})

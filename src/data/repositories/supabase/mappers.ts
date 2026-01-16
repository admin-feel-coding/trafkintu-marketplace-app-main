import type { Category } from "@/domain/entities/Category"
import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"

export function mapListing(row: any): Listing {
  const rawImages = row.listing_images
  const images = Array.isArray(rawImages)
    ? rawImages.map((img: any) => img.url || img).filter(Boolean)
    : typeof rawImages === "string"
      ? safeParseArray(rawImages)
      : []

  // Price is stored in separate columns: price_kind and price_amount
  const price = {
    kind: row.price_kind as "fixed" | "from" | "quote",
    amount: row.price_amount ? Number(row.price_amount) : undefined,
  }

  return {
    id: row.id,
    pymeId: row.pyme_id,
    type: row.type,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    price,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    featuredAt: row.featured_at ? new Date(row.featured_at) : undefined,
    featuredUntil: row.featured_until ? new Date(row.featured_until) : undefined,
    createdAt: new Date(row.created_at),
    images,
  }
}

export function mapPyme(row: any): Pyme {
  return {
    id: row.id,
    ownerId: row.owner_id,
    rut: row.rut || "",
    name: row.name,
    description: row.description,
    whatsapp: row.whatsapp,
    email: row.email,
    phone: row.phone,
    address: row.address,
    hours: row.hours,
    website: row.website,
    bannerUrl: row.banner_url,
    avatarUrl: row.avatar_url,
    fulfillment: row.fulfillment,
    verificationStatus: row.verification_status || "unverified",
    verificationRequestedAt: row.verification_requested_at ? new Date(row.verification_requested_at) : undefined,
    verificationVerifiedAt: row.verification_verified_at ? new Date(row.verification_verified_at) : undefined,
    verificationNote: row.verification_note || undefined,
  }
}

export function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  }
}

function safeParseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function safeParseJSON(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

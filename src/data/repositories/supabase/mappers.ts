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

  const rawPrice = row.price
  const price =
    rawPrice && typeof rawPrice === "string"
      ? safeParseJSON(rawPrice)
      : rawPrice

  return {
    id: row.id,
    pymeId: row.pyme_id,
    type: row.type,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    price: price,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    createdAt: new Date(row.created_at),
    images,
  }
}

export function mapPyme(row: any): Pyme {
  return {
    id: row.id,
    ownerId: row.owner_id,
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

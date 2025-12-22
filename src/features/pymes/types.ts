import type { Listing } from "@/domain/entities/Listing"

export interface ListingInput extends Omit<Listing, "id" | "createdAt"> {}

export interface PymeContactInfo {
  name: string
  description: string
  whatsapp?: string
  email: string
  phone: string
  address?: string
  hours?: string
  website?: string
  avatarUrl?: string
  bannerUrl?: string
}

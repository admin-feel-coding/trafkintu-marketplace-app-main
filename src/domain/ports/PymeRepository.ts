import type { Pyme } from "../entities/Pyme"
import type { Listing } from "../entities/Listing"

export interface PymeRepository {
  getPymeById(id: string): Promise<Pyme | null>
  getListingsByPymeId(pymeId: string): Promise<Listing[]>
  createListing(pymeId: string, data: CreateListingData): Promise<Listing>
  updateListing(listingId: string, data: Partial<CreateListingData>): Promise<Listing>
  toggleListingActive(listingId: string): Promise<Listing>
  requestFeatured(listingId: string): Promise<void>
  updatePyme(pymeId: string, data: Partial<UpdatePymeData>): Promise<Pyme | null>
}

export interface CreateListingData {
  type: "product" | "service"
  categoryId: string
  title: string
  description: string
  price: {
    kind: "fixed" | "from" | "quote"
    amount?: number
  }
  images: string[]
}

export interface UpdatePymeData {
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

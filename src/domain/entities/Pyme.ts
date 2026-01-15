export interface Pyme {
  id: string
  ownerId: string
  rut: string
  name: string
  description: string
  whatsapp?: string
  email: string
  phone: string
  address?: string
  hours?: string
  website?: string // Added website field
  bannerUrl?: string // Added banner image
  avatarUrl?: string
  fulfillment: "local" | "delivery" | "both"
  verificationStatus: "unverified" | "pending" | "verified"
  verificationRequestedAt?: Date
  verificationVerifiedAt?: Date
  verificationNote?: string
}

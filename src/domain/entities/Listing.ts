export interface Listing {
  id: string
  pymeId: string
  type: "product" | "service"
  categoryId: string
  title: string
  description: string
  price: Price
  isActive: boolean
  isFeatured: boolean
  featuredAt?: Date
  featuredUntil?: Date
  createdAt: Date
  images: string[]
}

export interface Price {
  kind: "fixed" | "from" | "quote"
  amount?: number
}

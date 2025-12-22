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
  createdAt: Date
  images: string[]
}

export interface Price {
  kind: "fixed" | "from" | "quote"
  amount?: number
}

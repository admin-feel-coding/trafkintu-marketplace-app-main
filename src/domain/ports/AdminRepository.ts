export interface FeaturedRequest {
  id: string
  listingId: string
  pymeId: string
  requestedAt: Date
  status: "pending" | "approved" | "rejected" | "expired"
  planId?: string | null
  planDays?: number | null
  planPriceClp?: number | null
  paymentStatus?:
    | "pending"
    | "approved"
    | "rejected"
    | "in_process"
    | "cancelled"
    | "refunded"
    | "charged_back"
    | "expired"
  paymentProvider?: string | null
  paymentProviderId?: string | null
  paymentPreferenceId?: string | null
  paymentInitPoint?: string | null
  featuredAt?: Date | null
  featuredUntil?: Date | null
}

export interface AdminRepository {
  getFeaturedRequests(): Promise<FeaturedRequest[]>
  approveFeaturedRequest(requestId: string): Promise<void>
  rejectFeaturedRequest(requestId: string): Promise<void>
  toggleListingActive(listingId: string): Promise<void>
}

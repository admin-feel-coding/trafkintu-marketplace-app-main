export interface FeaturedRequest {
  id: string
  listingId: string
  pymeId: string
  requestedAt: Date
  status: "pending" | "approved" | "rejected"
}

export interface AdminRepository {
  getFeaturedRequests(): Promise<FeaturedRequest[]>
  approveFeaturedRequest(requestId: string): Promise<void>
  rejectFeaturedRequest(requestId: string): Promise<void>
  toggleListingActive(listingId: string): Promise<void>
}

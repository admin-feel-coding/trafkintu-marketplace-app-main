import type { FeaturedRequest } from "@/domain/ports/AdminRepository"

export interface FeaturedRequestAction {
  requestId: FeaturedRequest["id"]
  action: "approve" | "reject"
}

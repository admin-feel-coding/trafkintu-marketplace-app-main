import { authMockRepository } from "@/data/repositories/AuthMockRepository"

export async function requireAuth(requiredRole?: "user" | "pyme" | "admin") {
  const user = await authMockRepository.getCurrentUser()

  if (!user) {
    return { authorized: false as const, user: null }
  }

  if (requiredRole && user.role !== requiredRole) {
    return { authorized: false as const, user }
  }

  return { authorized: true as const, user }
}

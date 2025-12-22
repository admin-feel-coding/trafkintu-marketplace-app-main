"use client"

import { useState, useEffect } from "react"
import type { User } from "@/domain/ports/AuthRepository"
import { authMockRepository } from "@/data/repositories/AuthMockRepository"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await authMockRepository.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const logout = async () => {
    await authMockRepository.logout()
    setUser(null)
  }

  return { user, isLoading, logout }
}

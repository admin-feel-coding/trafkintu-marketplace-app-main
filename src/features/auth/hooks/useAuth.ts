"use client"

import { useState, useEffect } from "react"
import type { User } from "@/domain/ports/AuthRepository"

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      // Check cookies set by login API
      const role = getCookie("trafkintu_role")
      const pymeId = getCookie("trafkintu_pyme")

      if (role) {
        // Fetch full user data from API
        try {
          const response = await fetch("/api/auth/me")
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // Cookies exist but session invalid - clear them
            document.cookie = "trafkintu_role=; path=/; max-age=0"
            document.cookie = "trafkintu_pyme=; path=/; max-age=0"
          }
        } catch {
          // API error - use cookie data as fallback
          setUser({
            id: "",
            email: "",
            role: role as "user" | "pyme" | "admin",
            rut: "",
            displayName: "",
            pymeId: pymeId || undefined,
          })
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    // Clear cookies
    document.cookie = "trafkintu_role=; path=/; max-age=0"
    document.cookie = "trafkintu_pyme=; path=/; max-age=0"
    setUser(null)
    window.location.href = "/"
  }

  return { user, isLoading, logout }
}

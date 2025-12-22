"use client"

import { useState, useEffect } from "react"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"
import { marketplaceMockRepository } from "@/data/repositories/MarketplaceMockRepository"
import { mockPymes } from "@/data/mock/seed"
import { rankListings } from "@/domain/services/rankingService"
import { searchListings } from "@/domain/services/searchService"

export function useMarketplace(filters?: {
  categorySlug?: string
  type?: "product" | "service"
  searchQuery?: string
}) {
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pymes] = useState<Pyme[]>(mockPymes)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [loadedCategories, allListings] = await Promise.all([
          marketplaceMockRepository.getCategories(),
          marketplaceMockRepository.getListings({ isActive: true }),
        ])

        setCategories(loadedCategories)

        let filtered = allListings

        // Filter by category
        if (filters?.categorySlug) {
          const category = loadedCategories.find((c) => c.slug === filters.categorySlug)
          if (category) {
            filtered = filtered.filter((l) => l.categoryId === category.id)
          }
        }

        // Filter by type
        if (filters?.type) {
          filtered = filtered.filter((l) => l.type === filters.type)
        }

        // Search
        if (filters?.searchQuery) {
          filtered = searchListings(filtered, filters.searchQuery, loadedCategories, pymes)
        }

        // Rank (featured first, then by date)
        const ranked = rankListings(filtered)
        setListings(ranked)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters?.categorySlug, filters?.type, filters?.searchQuery, pymes])

  return { listings, categories, pymes, isLoading }
}

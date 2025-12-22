"use client"

import { useState, useEffect } from "react"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"
import { marketplaceRepository } from "@/data/repositories/marketplace"
import { getAllPymesAction } from "@/features/pymes/actions/pymeActions"
import { rankListings } from "@/domain/services/rankingService"
import { searchListings } from "@/domain/services/searchService"

export function useMarketplace(filters?: {
  categorySlug?: string
  type?: "product" | "service"
  searchQuery?: string
}) {
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pymes, setPymes] = useState<Pyme[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [loadedCategories, allListings, loadedPymes] = await Promise.all([
          marketplaceRepository.getCategories(),
          marketplaceRepository.getListings({ isActive: true }),
          getAllPymesAction(),
        ])

        setCategories(loadedCategories)
        setPymes(loadedPymes)

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
          filtered = searchListings(filtered, filters.searchQuery, loadedCategories, loadedPymes)
        }

        // Rank (featured first, then by date)
        const ranked = rankListings(filtered)
        setListings(ranked)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters?.categorySlug, filters?.type, filters?.searchQuery])

  return { listings, categories, pymes, isLoading }
}

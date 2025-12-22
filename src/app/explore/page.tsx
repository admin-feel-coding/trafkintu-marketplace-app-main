"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PackageSearch } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListingsGrid } from "@/features/marketplace/components/ListingsGrid"
import { useMarketplace } from "@/features/marketplace/hooks/useMarketplace"
import { CategoryChips } from "@/features/marketplace/components/CategoryChips"
import { EmptyState } from "@/shared/components/EmptyState"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"
import { PageHeader } from "@/shared/components/PageHeader"
import { SearchBar } from "@/shared/components/SearchBar"

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get("cat") || undefined
  const typeParam = searchParams.get("type")

  const [searchQuery, setSearchQuery] = useState("")
  const [type, setType] = useState<"product" | "service" | undefined>(() =>
    typeParam === "product" || typeParam === "service" ? typeParam : undefined,
  )

  const { listings, categories, pymes, isLoading } = useMarketplace({
    categorySlug,
    type,
    searchQuery,
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Explorar Marketplace"
            description="Encuentra productos y servicios de emprendimientos locales"
          />

          {/* Search and Filters */}
          <div className="space-y-6 mb-8">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CategoryChips categories={categories} selectedSlug={categorySlug} />

              <Tabs
                value={type || "all"}
                onValueChange={(value) => setType(value === "all" ? undefined : (value as "product" | "service"))}
              >
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="product">Productos</TabsTrigger>
                  <TabsTrigger value="service">Servicios</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground mb-6">
              {listings.length} {listings.length === 1 ? "resultado" : "resultados"} encontrados
            </p>
          )}

          {/* Listings Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <ListingsGrid listings={listings} categories={categories} pymes={pymes} />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No se encontraron resultados"
              description="Intenta ajustar tus filtros o buscar con otros términos"
              action={{
                label: "Limpiar filtros",
                onClick: () => {
                  setSearchQuery("")
                  setType(undefined)
                  window.history.pushState({}, "", "/explore")
                },
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

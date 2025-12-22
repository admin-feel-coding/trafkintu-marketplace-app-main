"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListingsGrid } from "@/features/marketplace/components/ListingsGrid"
import { EmptyState } from "@/shared/components/EmptyState"
import { PackageOpen } from "lucide-react"
import type { Listing } from "@/domain/entities/Listing"
import type { Category } from "@/domain/entities/Category"
import type { Pyme } from "@/domain/entities/Pyme"

interface PymeCatalogProps {
  listings: Listing[]
  categories: Category[]
  pymes: Pyme[]
}

export function PymeCatalog({ listings, categories, pymes }: PymeCatalogProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all")

  const filteredListings = typeFilter === "all" ? listings : listings.filter((listing) => listing.type === typeFilter)

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catálogo</h2>

        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="product">Productos</TabsTrigger>
            <TabsTrigger value="service">Servicios</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredListings.length > 0 ? (
        <ListingsGrid listings={filteredListings} categories={categories} pymes={pymes} />
      ) : (
        <EmptyState
          icon={PackageOpen}
          title="No hay publicaciones"
          description={
            typeFilter === "all"
              ? "Este emprendimiento aún no tiene publicaciones activas"
              : `No hay ${typeFilter === "product" ? "productos" : "servicios"} disponibles`
          }
        />
      )}
    </>
  )
}

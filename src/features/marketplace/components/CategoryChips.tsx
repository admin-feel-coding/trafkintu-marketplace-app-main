"use client"

import { Badge } from "@/components/ui/badge"
import type { Category } from "@/domain/entities/Category"
import Link from "next/link"

interface CategoryChipsProps {
  categories: Category[]
  selectedSlug?: string
}

export function CategoryChips({ categories, selectedSlug }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/explore">
        <Badge
          variant={!selectedSlug ? "default" : "outline"}
          className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Todas
        </Badge>
      </Link>
      {categories.map((category) => (
        <Link key={category.id} href={`/explore?cat=${category.slug}`}>
          <Badge
            variant={selectedSlug === category.slug ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {category.name}
          </Badge>
        </Link>
      ))}
    </div>
  )
}

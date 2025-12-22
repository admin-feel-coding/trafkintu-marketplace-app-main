"use server"

import type { Listing } from "@/domain/entities/Listing"
import { addServerListing, updateServerListing, deleteServerListing, getServerListings } from "@/data/mock/storage"

export async function getMyListingsAction(pymeId: string): Promise<Listing[]> {
  const listings = getServerListings()
  return listings.filter((l) => l.pymeId === pymeId)
}

export async function createListingAction(listing: Omit<Listing, "id" | "createdAt">) {
  const newListing: Listing = {
    ...listing,
    id: `list-${Date.now()}`,
    createdAt: new Date(),
  }

  console.log("[v0][SERVER ACTION] Creating listing:", newListing.id)
  addServerListing(newListing)

  return newListing
}

export async function updateListingAction(id: string, data: Partial<Omit<Listing, "id" | "pymeId" | "createdAt">>) {
  console.log("[v0][SERVER ACTION] Updating listing:", id)
  const listings = getServerListings()
  const existing = listings.find((l) => l.id === id)

  if (!existing) {
    throw new Error("Listing not found")
  }

  const updated = { ...existing, ...data }
  updateServerListing(updated)
  return updated
}

export async function deleteListingAction(id: string): Promise<boolean> {
  console.log("[v0][SERVER ACTION] Deleting listing:", id)
  deleteServerListing(id)
  return true
}

export async function toggleActiveAction(id: string) {
  const listings = getServerListings()
  const listing = listings.find((l) => l.id === id)

  if (!listing) {
    throw new Error("Listing not found")
  }

  const updated = { ...listing, isActive: !listing.isActive }
  updateServerListing(updated)
  return updated
}

// Almacenamiento en memoria del lado del servidor para datos mock
// En producción, esto sería reemplazado por una base de datos real

import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"
import type { Category } from "@/domain/entities/Category"
import { mockListings, mockPymes, mockCategories } from "./seed"

// Inicializar con datos seed
let serverListings: Listing[] = [...mockListings]
const serverPymes: Pyme[] = [...mockPymes]
const serverCategories: Category[] = [...mockCategories]

export const getServerListings = () => serverListings
export const getServerPymes = () => serverPymes
export const getServerCategories = () => serverCategories

export const addServerListing = (listing: Listing) => {
  serverListings.push(listing)
}

export const updateServerListing = (listing: Listing) => {
  const index = serverListings.findIndex((l) => l.id === listing.id)
  if (index !== -1) {
    serverListings[index] = listing
  }
}

export const deleteServerListing = (id: string) => {
  serverListings = serverListings.filter((l) => l.id !== id)
}

export const addServerPyme = (pyme: Pyme) => {
  serverPymes.push(pyme)
}

export const updateServerPyme = (pyme: Pyme) => {
  const index = serverPymes.findIndex((p) => p.id === pyme.id)
  if (index !== -1) {
    serverPymes[index] = pyme
  }
}

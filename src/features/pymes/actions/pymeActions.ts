"use server"

import { getServerPymes } from "@/data/mock/storage"
import type { Pyme } from "@/domain/entities/Pyme"

export async function updatePymeAction(
  pymeId: string,
  data: {
    name: string
    description: string
    whatsapp?: string
    email: string
    phone: string
    address?: string
    hours?: string
    website?: string
    avatarUrl?: string
    bannerUrl?: string
  },
): Promise<Pyme | null> {
  const pymes = getServerPymes()
  const pymeIndex = pymes.findIndex((p) => p.id === pymeId)

  if (pymeIndex === -1) {
    return null
  }

  const updatedPyme: Pyme = {
    ...pymes[pymeIndex],
    ...data,
  }

  pymes[pymeIndex] = updatedPyme

  console.log(`[SERVER][v0] Updated PYME: ${pymeId}`)
  return updatedPyme
}

export async function getPymeByIdAction(pymeId: string): Promise<Pyme | null> {
  const pymes = getServerPymes()
  return pymes.find((p) => p.id === pymeId) || null
}

export async function getAllPymesAction(): Promise<Pyme[]> {
  const pymes = getServerPymes()
  return pymes
}

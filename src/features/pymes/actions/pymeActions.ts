"use server"

import type { Pyme } from "@/domain/entities/Pyme"
import { supabaseAdmin } from "@/shared/lib/supabase/admin"
import { mapPyme } from "@/data/repositories/supabase/mappers"


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
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: updated, error } = await supabase
    
    .from("pymes")
    .update({
      name: data.name,
      description: data.description,
      whatsapp: data.whatsapp || null,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      hours: data.hours || null,
      website: data.website || null,
      avatar_url: data.avatarUrl || null,
      banner_url: data.bannerUrl || null,
    })
    .eq("id", pymeId)
    .select("*")
    .maybeSingle()

  if (error) {
    console.error("[updatePymeAction] Error:", error)
    throw new Error("Error al actualizar el negocio")
  }

  if (!updated) return null
  return mapPyme(updated)
}

export async function getPymeByIdAction(pymeId: string): Promise<Pyme | null> {
  const supabase = supabaseAdmin()
  if (!supabase) return null

  const { data, error } = await supabase
    
    .from("pymes")
    .select("*")
    .eq("id", pymeId)
    .maybeSingle()

  if (error || !data) return null
  return mapPyme(data)
}

export async function getPymeByOwnerIdAction(ownerId: string): Promise<Pyme | null> {
  const supabase = supabaseAdmin()
  if (!supabase) return null

  const { data, error } = await supabase
    
    .from("pymes")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error || !data) return null
  return mapPyme(data)
}

export async function getAllPymesAction(): Promise<Pyme[]> {
  const supabase = supabaseAdmin()
  if (!supabase) return []

  const { data, error } = await supabase
    
    .from("pymes")
    .select("*")

  if (error || !data) return []
  return data.map(mapPyme)
}

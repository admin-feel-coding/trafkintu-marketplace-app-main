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

export async function requestPymeVerificationAction(pymeId: string, rut: string): Promise<Pyme | null> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: updated, error } = await supabase
    .from("pymes")
    .update({
      rut,
      verification_status: "pending",
      verification_requested_at: new Date().toISOString(),
      verification_verified_at: null,
      verification_note: null,
    })
    .eq("id", pymeId)
    .select("*")
    .maybeSingle()

  if (error) {
    console.error("[requestPymeVerificationAction] Error:", error)
    throw new Error("Error al solicitar verificación")
  }

  if (!updated) return null
  return mapPyme(updated)
}

export async function approvePymeVerificationAction(pymeId: string): Promise<Pyme | null> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: updated, error } = await supabase
    .from("pymes")
    .update({
      verification_status: "verified",
      verification_verified_at: new Date().toISOString(),
      verification_note: null,
    })
    .eq("id", pymeId)
    .select("*")
    .maybeSingle()

  if (error) {
    console.error("[approvePymeVerificationAction] Error:", error)
    throw new Error("Error al aprobar verificación")
  }

  if (!updated) return null
  return mapPyme(updated)
}

export async function rejectPymeVerificationAction(pymeId: string, note: string): Promise<Pyme | null> {
  const supabase = supabaseAdmin()
  if (!supabase) throw new Error("Supabase no configurado")

  const { data: updated, error } = await supabase
    .from("pymes")
    .update({
      verification_status: "unverified",
      verification_requested_at: null,
      verification_verified_at: null,
      verification_note: note || "Sin comentario",
    })
    .eq("id", pymeId)
    .select("*")
    .maybeSingle()

  if (error) {
    console.error("[rejectPymeVerificationAction] Error:", error)
    throw new Error("Error al rechazar verificación")
  }

  if (!updated) return null
  return mapPyme(updated)
}

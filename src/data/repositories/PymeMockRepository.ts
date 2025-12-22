// Wrapper para mantener compatibilidad con imports existentes.
import { PymeSupabaseRepository } from "@/data/repositories/supabase/PymeSupabaseRepository"

const repo = new PymeSupabaseRepository()

export const pymeMockRepository = repo
export const pymeRepository = repo

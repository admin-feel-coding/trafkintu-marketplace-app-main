// Wrapper para mantener compatibilidad con imports existentes.
import { AdminSupabaseRepository } from "@/data/repositories/supabase/AdminSupabaseRepository"

const repo = new AdminSupabaseRepository()

export const adminMockRepository = repo
export const adminRepository = repo

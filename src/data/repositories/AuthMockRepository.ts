// Wrapper para mantener compatibilidad con imports existentes.
import { AuthSupabaseRepository } from "@/data/repositories/supabase/AuthSupabaseRepository"

const repo = new AuthSupabaseRepository()

export const authMockRepository = repo
export const authRepository = repo

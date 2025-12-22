// Wrapper para mantener compatibilidad con imports existentes.
import { MarketplaceSupabaseRepository } from "@/data/repositories/supabase/MarketplaceSupabaseRepository"

const repo = new MarketplaceSupabaseRepository()

export const marketplaceMockRepository = repo
export const marketplaceRepository = repo

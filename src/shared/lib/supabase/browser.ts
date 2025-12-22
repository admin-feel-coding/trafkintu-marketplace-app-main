import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

import { env } from "@/shared/lib/env"

export const supabaseBrowser = (): SupabaseClient | null => {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return null
  }
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    isSingleton: false,
  })
}

const clean = (value: string | undefined) => value?.replace(/^["']|["']$/g, "") || ""

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: clean(process.env.NEXT_PUBLIC_SUPABASE_URL || (process as any).env?.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: clean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (process as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  SUPABASE_SERVICE_ROLE_KEY: clean(process.env.SUPABASE_SERVICE_ROLE_KEY || (process as any).env?.SUPABASE_SERVICE_ROLE_KEY),
}

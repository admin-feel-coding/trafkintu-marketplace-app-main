import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"


export async function POST(request: Request) {
  const { email, password } = await request.json()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
  }

  const meta = data.user.user_metadata || {}

  // Get pyme_id if user is pyme
  let pymeId = meta.pyme_id

  if (meta.role === "pyme" && !pymeId) {
    // Try to find pyme by owner_id
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
    )
    const { data: pyme } = await supabaseAdmin
      
      .from("pymes")
      .select("id")
      .eq("owner_id", data.user.id)
      .maybeSingle()

    if (pyme) {
      pymeId = pyme.id
    }
  }

  const user = {
    id: data.user.id,
    email: data.user.email || "",
    role: meta.role || "user",
    rut: meta.rut,
    displayName: meta.display_name,
    pymeId,
  }

  const res = NextResponse.json(user)
  res.cookies.set("trafkintu_role", user.role, { path: "/", maxAge: 60 * 60 * 24 * 7 })
  if (pymeId) {
    res.cookies.set("trafkintu_pyme", pymeId, { path: "/", maxAge: 60 * 60 * 24 * 7 })
  }

  return res
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const cookieStore = await cookies()
  const role = cookieStore.get("trafkintu_role")?.value
  const pymeId = cookieStore.get("trafkintu_pyme")?.value

  if (!role) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    // Return basic info from cookies if Supabase not configured
    return NextResponse.json({
      id: "",
      email: "",
      role,
      pymeId,
    })
  }

  // If pyme, get pyme details
  if (role === "pyme" && pymeId) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: pyme } = await supabase
      .from("pymes")
      .select("*")
      .eq("id", pymeId)
      .maybeSingle()

    if (pyme) {
      return NextResponse.json({
        id: pyme.owner_id,
        email: pyme.email,
        role,
        pymeId,
        displayName: pyme.name,
      })
    }
  }

  return NextResponse.json({
    id: "",
    email: "",
    role,
    pymeId,
  })
}

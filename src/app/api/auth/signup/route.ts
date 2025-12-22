import { NextResponse } from "next/server"

import type { RegisterData, User } from "@/domain/ports/AuthRepository"
import { supabaseAdmin } from "@/shared/lib/supabase/admin"

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterData
  const admin = supabaseAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 })
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      role: body.role,
      rut: body.rut,
      display_name: body.displayName,
      pyme_id: body.role === "pyme" ? `pyme-${Date.now()}` : undefined,
    },
  })

  if (error || !data?.user) {
    return NextResponse.json({ error: error?.message || "Error creating user" }, { status: 400 })
  }

  const meta = data.user.user_metadata || {}
  const user: User = {
    id: data.user.id,
    email: data.user.email || "",
    role: meta.role,
    rut: meta.rut,
    displayName: meta.display_name,
    pymeId: meta.pyme_id,
  }

  if (user.role === "pyme" && user.pymeId) {
    await admin.from("pymes").insert({
      id: user.pymeId,
      owner_id: user.id,
      name: body.pymeName || body.displayName,
      description: "",
      email: body.email,
      phone: "",
      fulfillment: "local",
    })
  }

  const res = NextResponse.json(user)
  res.cookies.set("trafkintu_role", user.role, { path: "/", maxAge: 60 * 60 * 24 * 7 })
  if (user.pymeId) {
    res.cookies.set("trafkintu_pyme", user.pymeId, { path: "/", maxAge: 60 * 60 * 24 * 7 })
  }
  return res
}

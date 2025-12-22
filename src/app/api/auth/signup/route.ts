import { NextResponse } from "next/server"

import type { RegisterData, User } from "@/domain/ports/AuthRepository"
import { supabaseAdmin } from "@/shared/lib/supabase/admin"


export async function POST(request: Request) {
  const body = (await request.json()) as RegisterData
  const admin = supabaseAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 })
  }

  // First create the user
  const { data, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      app_id: "trafkintu",
      role: body.role,
      rut: body.rut,
      display_name: body.displayName,
    },
  })

  if (error || !data?.user) {
    return NextResponse.json({ error: error?.message || "Error creating user" }, { status: 400 })
  }

  const meta = data.user.user_metadata || {}
  let pymeId: string | undefined

  // If role is pyme, create the pyme record
  if (body.role === "pyme") {
    const { data: pymeData, error: pymeError } = await admin
      
      .from("pymes")
      .insert({
        owner_id: data.user.id,
        name: body.pymeName || body.displayName,
        description: "",
        email: body.email,
        phone: body.phone || "",
        fulfillment: "both",
      })
      .select("id")
      .single()

    if (pymeError) {
      console.error("[signup] Error creating pyme:", pymeError)
      // Still return the user but without pymeId
    } else {
      pymeId = pymeData.id

      // Update user metadata with pyme_id
      await admin.auth.admin.updateUserById(data.user.id, {
        user_metadata: {
          ...meta,
          pyme_id: pymeId,
        },
      })
    }
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email || "",
    role: meta.role,
    rut: meta.rut,
    displayName: meta.display_name,
    pymeId: pymeId,
  }

  const res = NextResponse.json(user)
  res.cookies.set("trafkintu_role", user.role, { path: "/", maxAge: 60 * 60 * 24 * 7 })
  if (pymeId) {
    res.cookies.set("trafkintu_pyme", pymeId, { path: "/", maxAge: 60 * 60 * 24 * 7 })
  }
  return res
}

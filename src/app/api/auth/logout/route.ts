import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()

  // Clear auth cookies
  cookieStore.delete("trafkintu_role")
  cookieStore.delete("trafkintu_pyme")

  return NextResponse.json({ success: true })
}

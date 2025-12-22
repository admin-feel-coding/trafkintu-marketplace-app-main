import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ROLE_COOKIE = "trafkintu_role"

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const role = req.cookies.get(ROLE_COOKIE)?.value

  // Rutas protegidas
  if (pathname.startsWith("/dashboard")) {
    if (role !== "pyme") {
      return NextResponse.redirect(withRedirect(req, "/auth"))
    }
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(withRedirect(req, "/auth"))
    }
  }

  if (pathname.startsWith("/profile")) {
    if (!role) {
      return NextResponse.redirect(withRedirect(req, "/auth"))
    }
  }

  return NextResponse.next()
}

function withRedirect(req: NextRequest, to: string) {
  const url = req.nextUrl.clone()
  url.pathname = to
  url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search)
  return url
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile"],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const visitorToken = request.cookies.get("visitor_token")

  if (!visitorToken) {
    response.cookies.set("visitor_token", crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "none",
      secure:true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    })
  }

  return response
}

export const config = {
  matcher: ["/pub/:path*"]
}

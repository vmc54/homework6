import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const session = await auth.api.getSession({
    headers: await headers()
  })

  const user = session?.user

  if (pathname.startsWith("/todos") && !user) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  if (pathname.startsWith("/admin") && (!user || user.role !== "admin")) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    matcher: ["/todos/:path*", "/admin/:path*"]
}

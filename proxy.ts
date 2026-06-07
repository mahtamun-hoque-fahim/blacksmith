import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has('better-auth.session_token')
  const { pathname } = request.nextUrl
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/generate')
  if (isProtected && !hasSession) return NextResponse.redirect(new URL('/sign-in', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/generate/:path*'],
}

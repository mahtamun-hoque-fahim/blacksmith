import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit }                 from '@upstash/ratelimit'
import { Redis }                     from '@upstash/redis'

// ── Auth rate limiter ──────────────────────────────────────────
// 10 requests per 60 seconds per IP on /api/auth routes.
// Prevents brute-force of email/password sign-in.
// Instantiated at module level — stateless, state lives in Redis.
const authRl = new Ratelimit({
  redis:   Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix:  'blacksmith:rl:auth',
})

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Gate 1 — rate-limit all auth API routes
  if (pathname.startsWith('/api/auth')) {
    const ip = (
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    )
    const { success } = await authRl.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 },
      )
    }
  }

  // Gate 2 — redirect unauthenticated users away from protected routes
  // NOTE: This checks cookie PRESENCE only (UX redirect helper).
  //       Real session validation happens in each Server Component via requireUser().
  const hasSession  = request.cookies.has('better-auth.session_token')
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/generate')
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/api/auth/:path*',
  ],
}

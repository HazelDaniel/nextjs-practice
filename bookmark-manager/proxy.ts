// Higher-level concept: Proxy — Next 16's rename of Middleware.
// It runs on EVERY matched request BEFORE your route renders, at the network
// boundary (deployable to a CDN/edge). The "proxy" name signals what it is: a
// network boundary in front of your app, NOT Express-style middleware to be
// stuffed with business logic. Use it as a coarse, fast guard only.
//
// Division of labor (defense in depth):
//   - proxy.ts  → cheap, STATELESS cookie check (signature + TTL), redirect to
//                 /login for UX. Teaching caveat from the Next docs: never rely
//                 on Proxy alone for security.
//   - the app   → the AUTHORITATIVE check via getSessionUser() in every Server
//                 Component / Action / Route Handler (lib/auth.ts). This is
//                 also why the matcher below does NOT skip Server Action POSTs.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, hasValidSessionCookie } from '@/lib/session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthed = hasValidSessionCookie(request.cookies.get(SESSION_COOKIE)?.value)

  // API: no redirect, respond with JSON directly (clients expect 401).
  if (pathname.startsWith('/api')) {
    if (!isAuthed) {
      return Response.json({ error: 'Not authorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Already signed in → skip the login page.
  if (pathname === '/login' && isAuthed && request.method === 'GET') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Guard pages. GET only — non-GET requests (e.g. Server Action POSTs from a
  // stale tab) pass through so their own getSessionUser() check can respond
  // gracefully, per the docs' "verify inside each function" guidance.
  if (request.method === 'GET' && pathname !== '/login' && !isAuthed) {
    // Preserve where the user was headed so login can bounce them back.
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }
}

// Match everything EXCEPT internal assets/metadata. `api` is intentionally NOT
// excluded — the proxy branch above handles it with a 401 instead of a redirect.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)',
  ],
}
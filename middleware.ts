import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  // Protect /report (API already enforces auth for POST). We check an HttpOnly cookie set at login.
  const jwt = req.cookies.get('scammap_jwt')?.value
  if (!jwt) {
    const next = encodeURIComponent(url.pathname + (url.search || ''))
    const loginUrl = new URL(`/auth/login?next=${next}`, url.origin)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/report']
}

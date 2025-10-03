import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lightweight JWT expiration check (no signature verification)
function isTokenExpired(token: string): boolean {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return true
    const json = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const payload = JSON.parse(json)
    const exp = typeof payload.exp === 'number' ? payload.exp * 1000 : 0
    if (!exp) return true
    return Date.now() >= exp
  } catch {
    return true
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard /admin routes (public routes remain untouched as requested)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value

    // Missing token OR expired/invalid -> force logout + redirect to /login
    if (!token || isTokenExpired(token)) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      // Clear cookie to ensure client state resets
      response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

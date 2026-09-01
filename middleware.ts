import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const REFERRAL_COOKIE = 'star_haven_referral'
const REFERRAL_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Edge middleware.
 *
 * We read the Auth.js JWT with `getToken` (edge-safe — no Prisma/bcrypt) rather
 * than importing the full auth config, so the middleware bundle stays within
 * the Edge runtime constraints.
 */
export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const { pathname, searchParams } = nextUrl

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    // Auth.js v5 uses the `authjs.session-token` cookie name by default.
    salt:
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
  })

  const isLoggedIn = !!token
  const role = (token?.role as string | undefined) ?? 'client'

  const isDashboard = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/dashboard/admin')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  // Build the response first so we can attach the referral cookie regardless of
  // which branch handles the request.
  const attachReferral = (res: NextResponse) => {
    const ref = searchParams.get('ref')
    if (ref) {
      res.cookies.set(REFERRAL_COOKIE, ref, {
        maxAge: REFERRAL_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
      })
    }
    return res
  }

  // Protected dashboard routes require authentication.
  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return attachReferral(NextResponse.redirect(loginUrl))
  }

  // Admin-only routes require the admin role.
  if (isAdminRoute && isLoggedIn && role !== 'admin') {
    return attachReferral(NextResponse.redirect(new URL('/dashboard', nextUrl)))
  }

  // Authenticated users shouldn't see the auth pages.
  if (isAuthRoute && isLoggedIn) {
    return attachReferral(NextResponse.redirect(new URL('/dashboard', nextUrl)))
  }

  return attachReferral(NextResponse.next())
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
}

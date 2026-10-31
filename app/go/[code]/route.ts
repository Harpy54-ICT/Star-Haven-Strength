import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Public affiliate click-tracking + attribution redirect.
 *
 * A partner shares a link like `/go/<trackingParam>` (optionally with a
 * same-site `?to=/some/path`). Hitting it:
 *   1. records an AffiliateClick for the matching ACTIVE partner,
 *   2. sets an httpOnly `shs_aff` cookie (30 days) so a later checkout can be
 *      attributed to the partner,
 *   3. redirects to the requested same-site path (defaults to `/home`).
 *
 * This route is public — middleware only guards `/dashboard` and `/api/admin`,
 * so no login is required.
 */

const AFF_COOKIE = 'shs_aff'
const AFF_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/** Only allow same-site relative paths as the redirect target. */
function safePath(to: string | null): string {
  if (!to) return '/home'
  if (!to.startsWith('/') || to.startsWith('//')) return '/home'
  return to
}

export async function GET(
  req: Request,
  ctx: { params: { code: string } }
) {
  const code = ctx.params.code
  const { searchParams, origin } = new URL(req.url)
  const dest = safePath(searchParams.get('to'))
  const res = NextResponse.redirect(new URL(dest, origin))

  if (!code) return res

  const partner = await db.affiliatePartner.findFirst({
    where: { trackingParam: code, isActive: true },
    select: { id: true },
  })
  if (!partner) return res

  // Attribute the click to the logged-in user, if there is one.
  let userId: string | null = null
  try {
    const session = await auth()
    userId = session?.user?.id ?? null
  } catch {
    userId = null
  }

  await db.affiliateClick
    .create({ data: { partnerId: partner.id, userId } })
    .catch(() => null)

  res.cookies.set(AFF_COOKIE, code, {
    maxAge: AFF_MAX_AGE,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })

  return res
}

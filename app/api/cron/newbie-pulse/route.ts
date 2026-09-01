import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Weekly "newbie pulse" cron (scheduled in vercel.json: Mondays 09:00 UTC).
 *
 * Protected by CRON_SECRET — Vercel Cron sends it as a Bearer token.
 * TODO: implement newbie phase progression / availability tapering logic.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: advance newbie designations, taper availability, send notifications.
  return NextResponse.json({ ok: true, ran: 'newbie-pulse' })
}

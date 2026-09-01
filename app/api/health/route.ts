import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

/**
 * Health check. Verifies the database is reachable.
 */
export async function GET() {
  try {
    await db.user.count()
    return NextResponse.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    console.error('[health] Database check failed:', error)
    return NextResponse.json(
      { status: 'error', database: 'disconnected' },
      { status: 500 }
    )
  }
}

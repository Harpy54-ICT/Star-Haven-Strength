import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/auth/guards'

/**
 * Wrap an API route handler with consistent error handling.
 *
 * - AuthError → responds with { error } and the error's status code.
 * - Any other error → logged server-side and returned as a generic 500 so we
 *   never leak internal details (stack traces, DB errors) to the client.
 *
 * Usage:
 *   export const GET = withAuth(async (req) => {
 *     const session = await requireAuth()
 *     return NextResponse.json({ ... })
 *   })
 */
export function withAuth<T extends unknown[]>(
  handler: (...args: T) => Promise<Response> | Response
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }

      console.error('[api] Unhandled error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

import { db } from '@/lib/db/client'

/**
 * Lightweight database-backed rate limiter.
 *
 * Why a DB and not in-memory: the app runs on serverless (Vercel), where each
 * request can land on a fresh instance with its own memory. An in-memory counter
 * would reset constantly and provide almost no protection. A shared table gives a
 * consistent count across all instances with no extra paid service.
 *
 * Design notes:
 *  - Each attempt inserts one row keyed by "<action>:<identifier>" (identifier is
 *    usually the client IP, sometimes the email for login).
 *  - We count rows inside a rolling window; over the limit -> blocked.
 *  - It FAILS OPEN: if the limiter itself errors (DB hiccup), we allow the
 *    request so a limiter bug can never lock real users out.
 *  - Old rows are pruned opportunistically (roughly 1 in 10 calls) so the table
 *    stays small without a separate cleanup job.
 */

export interface RateLimitOptions {
  /** Logical action name, e.g. "login", "register". */
  action: string
  /** Stable caller identifier — usually IP, or email for login. */
  identifier: string
  /** Max attempts allowed within the window. */
  limit: number
  /** Rolling window length in seconds. */
  windowSeconds: number
}

export interface RateLimitResult {
  /** True if the request is allowed to proceed. */
  ok: boolean
  /** Seconds the caller should wait before trying again (when blocked). */
  retryAfterSeconds: number
}

/**
 * Best-effort extraction of the client IP from a request's headers.
 * Falls back to "unknown" so a missing header never throws.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    // May be a comma-separated list; the first entry is the original client.
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Check and record one attempt. Returns whether the caller may proceed.
 */
export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { action, identifier, limit, windowSeconds } = options
  const key = `${action}:${identifier}`
  const windowStart = new Date(Date.now() - windowSeconds * 1000)

  try {
    const recentCount = await db.rateLimitHit.count({
      where: { key, createdAt: { gte: windowStart } },
    })

    if (recentCount >= limit) {
      return { ok: false, retryAfterSeconds: windowSeconds }
    }

    // Record this attempt.
    await db.rateLimitHit.create({ data: { key } })

    // Opportunistic cleanup of rows older than the window (~10% of calls).
    if (Math.random() < 0.1) {
      await db.rateLimitHit
        .deleteMany({ where: { createdAt: { lt: windowStart } } })
        .catch(() => {})
    }

    return { ok: true, retryAfterSeconds: 0 }
  } catch (error) {
    // Fail open: never block real users because of a limiter failure.
    console.error('[rate-limit] check failed, allowing request:', error)
    return { ok: true, retryAfterSeconds: 0 }
  }
}

/**
 * Convenience wrapper used by API routes: returns a ready-made 429 Response when
 * the limit is exceeded, or null when the caller may proceed.
 */
export async function enforceRateLimit(
  options: RateLimitOptions
): Promise<Response | null> {
  const result = await checkRateLimit(options)
  if (result.ok) return null

  return new Response(
    JSON.stringify({
      error: 'Too many attempts. Please wait a bit and try again.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds),
      },
    }
  )
}

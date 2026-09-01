import { db } from '@/lib/db/client'

/**
 * ============================================================================
 * CRITICAL SECURITY PATTERN — ALWAYS SCOPE QUERIES BY userId
 * ============================================================================
 *
 * Prisma does NOT enforce Postgres Row-Level Security (RLS). There is no
 * database-level guarantee that one user cannot read another user's rows.
 * Data isolation is entirely the application's responsibility.
 *
 * Therefore, EVERY query that touches user-owned data MUST include the
 * authenticated user's id in its `where` clause. Never trust a resource id
 * from the client alone — a malicious user can pass someone else's id.
 *
 * DO:
 *   const logs = await db.workoutLog.findMany({ where: { userId } })
 *   const log  = await db.workoutLog.findFirst({ where: { id, userId } })
 *
 * DON'T:
 *   const log = await db.workoutLog.findUnique({ where: { id } }) // ❌ no scope
 *
 * For mutations, prefer updateMany/deleteMany with a userId filter so a
 * non-owned id simply affects zero rows instead of leaking/altering data:
 *   await db.workoutLog.deleteMany({ where: { id, userId } })
 *
 * Use `requireOwnership(resourceUserId)` (lib/auth/guards) at the route level
 * as a second line of defense, but the query scope above is mandatory.
 * ============================================================================
 */

/**
 * Merge a caller-supplied `where` filter with a mandatory userId scope so it is
 * impossible to forget the ownership constraint. Returns a `where` object.
 *
 * Example:
 *   const where = scopedQuery(userId, { status: 'active' })
 *   await db.injuryLog.findMany({ where })
 */
export function scopedQuery<T extends Record<string, unknown>>(
  userId: string,
  where: T = {} as T
): T & { userId: string } {
  return { ...where, userId }
}

export { db }

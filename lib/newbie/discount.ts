import { db } from '@/lib/db/client'
import type { NewbieDesignation } from '@prisma/client'

/**
 * Newbie lifecycle + discount helpers.
 *
 * A "newbie" holds a NewbieDesignation for a fixed discount window after they
 * first subscribe (NEWBIE_3MONTHS coupon: $50 off for 3 months). After the
 * window closes the designation is expired (graduated).
 */

/** Length of the newbie discount window, in months. */
export const NEWBIE_DISCOUNT_MONTHS = 3

/** Add whole months to a date (UTC-safe). */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d
}

/** The date a designation's discount window ends. */
export function discountEndDate(designation: {
  startedAt: Date
}): Date {
  return addMonths(designation.startedAt, NEWBIE_DISCOUNT_MONTHS)
}

/**
 * Whether the given designation's discount window has elapsed as of `now`.
 * (Does not consider the `discountActive` flag — this is purely time-based.)
 */
export function isDesignationExpired(
  designation: { startedAt: Date },
  now: Date = new Date()
): boolean {
  return now >= discountEndDate(designation)
}

/**
 * Whole months of discount remaining (0 once the window has elapsed).
 */
export function remainingDiscountMonths(
  designation: { startedAt: Date },
  now: Date = new Date()
): number {
  const end = discountEndDate(designation)
  if (now >= end) return 0
  const msPerMonth = (1000 * 60 * 60 * 24 * 365.25) / 12
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / msPerMonth))
}

/**
 * Does this user currently hold an ACTIVE newbie designation (flag on AND the
 * time window still open)?
 */
export async function hasActiveNewbieDesignation(
  userId: string,
  now: Date = new Date()
): Promise<boolean> {
  const d = await db.newbieDesignation.findUnique({ where: { userId } })
  if (!d || !d.discountActive) return false
  return !isDesignationExpired(d, now)
}

/**
 * Expire a single designation: flip the flag, set the graduated timestamp and
 * phase. Idempotent. Returns the updated record.
 */
export async function expireDesignation(
  designation: NewbieDesignation,
  now: Date = new Date()
): Promise<NewbieDesignation> {
  return db.newbieDesignation.update({
    where: { id: designation.id },
    data: {
      discountActive: false,
      currentPhase: 'graduated',
      graduatedAt: designation.graduatedAt ?? now,
    },
  })
}

/**
 * Find and expire every designation whose discount window has elapsed but is
 * still marked active. Returns the expired designations (for notifications).
 */
export async function expireElapsedDesignations(
  now: Date = new Date()
): Promise<NewbieDesignation[]> {
  const active = await db.newbieDesignation.findMany({
    where: { discountActive: true },
  })
  const expired: NewbieDesignation[] = []
  for (const d of active) {
    if (isDesignationExpired(d, now)) {
      expired.push(await expireDesignation(d, now))
    }
  }
  return expired
}

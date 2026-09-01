/**
 * Core shared TypeScript types for Star Haven Strength.
 *
 * These string-literal unions mirror the Prisma enums and are used throughout
 * the app (forms, API payloads, UI) where a lightweight type is preferable to
 * importing the generated Prisma enum.
 */

/** Whether the account belongs to a civilian, an active-duty member, or a veteran. */
export type AccountType = 'civilian' | 'military' | 'veteran'

/** Application-level authorization role. */
export type UserRole = 'admin' | 'client'

/**
 * Subscription tier. Each tier exists in a civilian and a military variant
 * (military variants apply a discount). Eight values total.
 */
export type SubscriptionTier =
  | 'foundation_civilian'
  | 'custom_civilian'
  | 'performance_civilian'
  | 'elite_civilian'
  | 'foundation_military'
  | 'custom_military'
  | 'performance_military'
  | 'elite_military'

/** Stripe-aligned subscription lifecycle status. */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'

/** Billing cadence for a subscription. */
export type BillingPeriod = 'monthly' | 'annual'

/**
 * Phase of the "newbie" onboarding program that temporarily elevates coach
 * availability and applies an introductory discount.
 */
export type NewbiePhase = 'elevated' | 'tapering' | 'graduated'

/** How serious a logged injury is. */
export type InjurySeverity = 'mild' | 'moderate' | 'severe'

/** Current state of a logged injury. */
export type InjuryStatus = 'active' | 'recovering' | 'resolved'

/** Category of a personal record. */
export type PRType = 'strength' | 'endurance' | 'speed' | 'body'

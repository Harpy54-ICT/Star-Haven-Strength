/**
 * Level tiers derived from a user's lifetime XP (`user.totalXP`).
 *
 * Shared by the achievements page/API, the XP bar component, and the
 * leaderboard so the level label and thresholds stay consistent everywhere.
 */

export interface LevelTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Elite'
  /** Inclusive lower XP bound for this tier. */
  min: number
  /** Exclusive upper XP bound (null = no ceiling). */
  max: number | null
  /** Tailwind text color class for the tier label. */
  colorClass: string
  /** Tailwind background class for badges/pills. */
  bgClass: string
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    name: 'Bronze',
    min: 0,
    max: 500,
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-100 text-amber-800',
  },
  {
    name: 'Silver',
    min: 500,
    max: 2000,
    colorClass: 'text-slate-500',
    bgClass: 'bg-slate-100 text-slate-700',
  },
  {
    name: 'Gold',
    min: 2000,
    max: 5000,
    colorClass: 'text-gold-dark',
    bgClass: 'bg-gold/20 text-gold-dark',
  },
  {
    name: 'Platinum',
    min: 5000,
    max: 10000,
    colorClass: 'text-cyan-700',
    bgClass: 'bg-cyan-100 text-cyan-800',
  },
  {
    name: 'Elite',
    min: 10000,
    max: null,
    colorClass: 'text-green',
    bgClass: 'bg-green/15 text-green',
  },
]

export interface LevelInfo {
  tier: LevelTier
  /** XP into the current tier. */
  currentXP: number
  /** XP needed to reach the next tier (0 if at max tier). */
  nextThreshold: number
  /** XP remaining to the next tier (0 if at max tier). */
  xpToNext: number
  /** Progress through the current tier, 0..1 (1 at max tier). */
  progress: number
  /** Name of the next tier, or null if at the top. */
  nextTierName: string | null
}

/**
 * Resolve the level tier + progress info for a given lifetime XP total.
 */
export function getLevelInfo(totalXP: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXP || 0))
  const tier =
    LEVEL_TIERS.find(
      (t) => xp >= t.min && (t.max === null || xp < t.max)
    ) ?? LEVEL_TIERS[LEVEL_TIERS.length - 1]

  // At the top (Elite) tier there is no next threshold.
  if (tier.max === null) {
    return {
      tier,
      currentXP: xp - tier.min,
      nextThreshold: 0,
      xpToNext: 0,
      progress: 1,
      nextTierName: null,
    }
  }

  const span = tier.max - tier.min
  const into = xp - tier.min
  const nextIndex = LEVEL_TIERS.indexOf(tier) + 1
  const nextTierName = LEVEL_TIERS[nextIndex]?.name ?? null

  return {
    tier,
    currentXP: into,
    nextThreshold: tier.max,
    xpToNext: Math.max(0, tier.max - xp),
    progress: span > 0 ? Math.min(1, into / span) : 0,
    nextTierName,
  }
}

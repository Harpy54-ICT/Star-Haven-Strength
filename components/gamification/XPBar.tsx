import { getLevelInfo } from '@/lib/gamification/levels'

/**
 * XP progress bar with level label and next-level threshold.
 *
 * Server-component friendly (no client hooks). Pass the user's lifetime XP.
 */
export default function XPBar({
  totalXP,
  showLabel = true,
}: {
  totalXP: number
  showLabel?: boolean
}) {
  const info = getLevelInfo(totalXP)
  const pct = Math.round(info.progress * 100)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wide ${info.tier.bgClass}`}
          >
            {info.tier.name}
          </span>
          <span className="font-mono text-sm text-grey-dark">
            {info.nextTierName
              ? `${info.xpToNext.toLocaleString()} XP to ${info.nextTierName}`
              : 'Max level reached'}
          </span>
        </div>
      )}
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-grey-mid"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

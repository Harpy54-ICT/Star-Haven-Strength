import { BADGES } from '@/lib/gamification/badges'

export interface EarnedBadge {
  badgeId: string
  earnedAt: string | Date
}

/**
 * Grid of all badges. Earned badges render in full color with their earn date;
 * locked badges render greyed out with the requirement text.
 */
export default function BadgeGrid({ earned }: { earned: EarnedBadge[] }) {
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]))

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {BADGES.map((badge) => {
        const earnedAt = earnedMap.get(badge.id)
        const isEarned = !!earnedAt
        const date = earnedAt
          ? new Date(earnedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : null

        return (
          <div
            key={badge.id}
            className={`flex flex-col items-center rounded-xl border p-4 text-center transition ${
              isEarned
                ? 'border-gold bg-gold/5'
                : 'border-grey-mid bg-grey-light opacity-70'
            }`}
          >
            <span
              className={`text-3xl ${isEarned ? '' : 'grayscale'}`}
              aria-hidden
            >
              {badge.icon}
            </span>
            <p
              className={`mt-2 font-display text-sm font-bold ${
                isEarned ? 'text-green' : 'text-grey-dark'
              }`}
            >
              {badge.name}
            </p>
            <p className="mt-1 font-body text-xs text-grey-dark">
              {isEarned ? badge.description : badge.requirement}
            </p>
            {isEarned && date && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-gold-dark">
                Earned {date}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

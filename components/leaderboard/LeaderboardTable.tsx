interface Entry {
  firstName: string
  lastInitial: string
  totalXP: number
  level: string
  weeklyXP?: number
}

const MEDALS = ['🥇', '🥈', '🥉']

/** Styled leaderboard table with rank badges and level pills. */
export default function LeaderboardTable({
  entries,
  metric = 'total',
}: {
  entries: Entry[]
  metric?: 'total' | 'weekly'
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-grey-mid bg-white p-6 text-center font-body text-sm text-grey-dark">
        No members on the board yet. Be the first to earn XP!
      </p>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border border-grey-mid bg-white">
      <ul className="divide-y divide-grey-mid">
        {entries.map((e, i) => (
          <li
            key={`${e.firstName}-${i}`}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 text-center font-mono text-sm font-bold text-grey-dark">
                {i < 3 ? MEDALS[i] : i + 1}
              </span>
              <div>
                <p className="font-body text-sm font-semibold text-charcoal">
                  {e.firstName} {e.lastInitial}
                </p>
                <span className="rounded-full bg-green/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-green">
                  {e.level}
                </span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-gold-dark">
              {(metric === 'weekly' ? e.weeklyXP ?? 0 : e.totalXP).toLocaleString()} XP
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

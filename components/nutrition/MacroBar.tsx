/**
 * Macro progress bar — current vs goal with a gold fill.
 */
export default function MacroBar({
  label,
  current,
  goal,
  color = 'bg-gold',
  unit = 'g',
}: {
  label: string
  current: number
  goal: number
  color?: string
  unit?: string
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0
  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-display text-xs font-bold uppercase tracking-wide text-charcoal">
          {label}
        </span>
        <span className="font-mono text-xs text-grey-dark">
          {Math.round(current)}
          {goal > 0 ? ` / ${Math.round(goal)}` : ''}
          {unit}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-grey-mid">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

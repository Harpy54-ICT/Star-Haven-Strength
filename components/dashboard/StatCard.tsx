import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  /** Optional delta string e.g. "+2 this week" */
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  trend = 'neutral',
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-grey-mid bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green/10">
          <Icon size={20} className="text-green" />
        </span>
        {delta && (
          <span
            className={[
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              trend === 'up'
                ? 'bg-green/10 text-green'
                : trend === 'down'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-grey-mid/60 text-grey-dark',
            ].join(' ')}
          >
            {trend === 'up' && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 font-mono text-3xl font-bold text-charcoal">{value}</p>
      <p className="mt-1 font-body text-sm text-grey-dark">{label}</p>
    </div>
  )
}

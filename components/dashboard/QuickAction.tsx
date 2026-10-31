import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

type Variant = 'green' | 'gold' | 'outline'

interface QuickActionProps {
  icon: LucideIcon
  label: string
  href: string
  variant?: Variant
}

const VARIANTS: Record<Variant, string> = {
  green: 'bg-green text-gold hover:bg-green-light',
  gold: 'bg-gold text-charcoal hover:bg-gold-light',
  outline:
    'border border-grey-mid bg-white text-charcoal hover:border-green hover:bg-green/5',
}

export default function QuickAction({
  icon: Icon,
  label,
  href,
  variant = 'outline',
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className={[
        'flex flex-col items-center justify-center gap-2 rounded-xl p-5 text-center font-display text-sm font-semibold uppercase tracking-wide transition-colors',
        VARIANTS[variant],
      ].join(' ')}
    >
      <Icon size={24} />
      {label}
    </Link>
  )
}

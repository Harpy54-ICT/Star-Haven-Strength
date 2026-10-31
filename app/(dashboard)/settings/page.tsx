import Link from 'next/link'
import {
  CreditCard,
  User,
  Watch,
  Bell,
  Shield,
  ChevronRight,
} from 'lucide-react'

export const metadata = {
  title: 'Settings | Star Haven Strength',
}

const SETTINGS_LINKS = [
  {
    icon: CreditCard,
    title: 'Billing',
    description: 'Manage your plan, payment methods, and invoices.',
    href: '/dashboard/settings/billing',
  },
  {
    icon: User,
    title: 'Profile',
    description: 'Update your name, bio, goals, and military status.',
    href: '/dashboard/settings/profile',
  },
  {
    icon: Watch,
    title: 'Wearables',
    description: 'Connect and manage your wearable device integrations.',
    href: '/dashboard/settings/wearables',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Choose which updates and reminders you receive.',
    href: '/dashboard/settings/notifications',
  },
  {
    icon: Shield,
    title: 'Privacy',
    description: 'Control leaderboard visibility and data preferences.',
    href: '/dashboard/settings/privacy',
  },
]

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-grey-light px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Settings
        </h1>
        <p className="mt-1 font-body text-grey-dark">
          Manage your account and preferences.
        </p>

        <div className="mt-8 space-y-3">
          {SETTINGS_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group flex items-center gap-4 rounded-xl border border-grey-mid bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green/10">
                  <Icon size={22} className="text-green" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold text-charcoal">
                    {link.title}
                  </h2>
                  <p className="font-body text-sm text-grey-dark">
                    {link.description}
                  </p>
                </div>
                <ChevronRight
                  size={20}
                  className="text-grey-dark transition-transform group-hover:translate-x-1"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
import {
  CheckCircle2,
  ArrowRight,
  Dumbbell,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'

export const metadata = {
  title: 'Welcome | Star Haven Strength',
}

const NEXT_STEPS = [
  {
    icon: ClipboardList,
    title: 'Complete your intake',
    description:
      'Tell us about your goals, experience, and any injuries so we can tailor your training.',
    href: '/dashboard/onboarding',
    cta: 'Start intake',
  },
  {
    icon: Dumbbell,
    title: 'Explore your dashboard',
    description:
      'Log workouts, track progress, and view your personalized program.',
    href: '/dashboard',
    cta: 'Go to dashboard',
  },
  {
    icon: MessageSquare,
    title: 'Manage your plan',
    description:
      'View invoices, update payment methods, or change your plan anytime.',
    href: '/dashboard/settings/billing',
    cta: 'Billing settings',
  },
]

export default function WelcomePage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const hasSession = !!searchParams?.session_id

  return (
    <main className="min-h-screen bg-grey-light px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 text-center shadow-md sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green/10">
            <CheckCircle2 size={40} className="text-green" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold uppercase tracking-wide text-green">
            Welcome to Star Haven
          </h1>
          <p className="mt-3 font-body text-lg text-grey-dark">
            {hasSession
              ? 'Your subscription is confirmed. Let’s get you started.'
              : 'Your account is ready. Let’s get you started.'}
          </p>
          <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Train like a Star, Feel like a Star.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {NEXT_STEPS.map((step) => {
            const Icon = step.icon
            return (
              <Link
                key={step.title}
                href={step.href}
                className="group flex items-center gap-4 rounded-xl border border-grey-mid bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green/10">
                  <Icon size={24} className="text-green" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold text-charcoal">
                    {step.title}
                  </h2>
                  <p className="font-body text-sm text-grey-dark">
                    {step.description}
                  </p>
                </div>
                <span className="flex items-center gap-1 font-body text-sm font-medium text-green group-hover:text-green-light">
                  {step.cta}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { TIER_TEASERS } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'Services & Programs | Star Haven Strength',
  description:
    'Four coaching tiers for civilians and the military community — Foundation, Custom, Performance, and Elite. Progressive programming, logging, and accountability.',
}

const TIER_FEATURES: Record<string, string[]> = {
  Foundation: [
    'Structured base programming',
    'Full training & logging platform',
    'Progress tracking and PRs',
    'Community challenges',
  ],
  Custom: [
    'Everything in Foundation',
    'Individualized programming',
    'Goal- and schedule-based design',
    'Habit & nutrition tracking',
  ],
  Performance: [
    'Everything in Custom',
    'Sport-specific programming',
    'Closer accountability & check-ins',
    'Mobility & recovery protocols',
  ],
  Elite: [
    'Everything in Performance',
    'Highest level of coach access',
    'Priority scheduling & messaging',
    'Fully bespoke programming',
  ],
}

export default function ServicesPage() {
  return (
    <main>
      <section className="bg-charcoal px-4 py-20 text-center sm:px-6">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Services & Programs
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
          Coaching Built for Your Level
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/70">
          Every tier is available for civilians and the military community.
          Military members receive dedicated pricing — 20% off for life.
        </p>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
            {TIER_TEASERS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-xl border border-grey-mid bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-green">
                  {t.name}
                </h2>
                <p className="mt-2 font-body text-sm text-grey-dark">
                  {t.blurb}
                </p>

                <div className="mt-4 rounded-lg bg-grey-light p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-body text-xs uppercase text-grey-dark">
                      Civilian
                    </span>
                    <span className="font-mono text-lg font-bold text-charcoal">
                      {t.civilian}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-body text-xs uppercase text-grey-dark">
                      Military
                    </span>
                    <span className="font-mono text-lg font-bold text-gold-dark">
                      {t.military}
                    </span>
                  </div>
                </div>

                <ul className="mt-4 flex-1 space-y-2">
                  {(TIER_FEATURES[t.name] ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-green"
                      />
                      <span className="font-body text-sm text-charcoal">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-green px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-gold transition hover:bg-green-light"
                >
                  Choose {t.name} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center font-body text-sm text-grey-dark">
            Annual plans save 15%. New clients may qualify for $50 off for the
            first 3 months.{' '}
            <Link href="/pricing" className="font-semibold text-green underline">
              See full pricing & checkout →
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

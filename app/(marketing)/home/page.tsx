import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Dumbbell, Shield, Users } from 'lucide-react'
import {
  TAGLINE,
  PILLARS,
  AUDIENCES,
  TIER_TEASERS,
} from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'Star Haven Strength | Train like a Star, Feel like a Star.',
  description:
    'Veteran-owned performance coaching for youth athletes, adults, and the military community. Progressive strength, conditioning, mobility, and tactical readiness.',
}

const AUDIENCE_ICONS = [Users, Dumbbell, Shield]

export default function MarketingHome() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-charcoal px-4 py-24 text-center sm:px-6">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Star Haven Strength
        </span>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-extrabold uppercase tracking-wide text-white sm:text-6xl">
          {TAGLINE}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/70">
          Elite, progressive sports performance merged with the tactical
          discipline of the Navy. Coaching for youth athletes, adults, and the
          military community.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-green transition hover:brightness-95"
          >
            Get Started <ArrowRight size={18} />
          </Link>
          <Link
            href="/services"
            className="rounded-lg border border-white/30 px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition hover:border-gold hover:text-gold"
          >
            Explore Services
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
              Core Training Pillars
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-body text-grey-dark">
              A structured curriculum that adapts to every athlete&apos;s
              physical maturity and experience level.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-grey-mid bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-green">
                  {p.title}
                </h3>
                <p className="mt-3 font-body text-sm text-grey-dark">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
              Who We Train
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((a, i) => {
              const Icon = AUDIENCE_ICONS[i] ?? Users
              return (
                <div
                  key={a.title}
                  className="rounded-xl border border-grey-mid bg-grey-light p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-green/10">
                    <Icon className="text-green" size={24} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-wide text-charcoal">
                    {a.title}
                  </h3>
                  <p className="mt-2 font-body text-sm text-grey-dark">
                    {a.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
              Coaching Tiers
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-body text-grey-dark">
              Four tiers for civilians and the military community. Annual plans
              save 15%. Military members save 20% for life.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TIER_TEASERS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-xl border border-grey-mid bg-white p-6"
              >
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-green">
                  {t.name}
                </h3>
                <p className="mt-2 font-mono text-2xl font-bold text-charcoal">
                  {t.civilian}
                </p>
                <p className="font-mono text-sm text-gold-dark">
                  Military {t.military}
                </p>
                <p className="mt-3 flex-1 font-body text-sm text-grey-dark">
                  {t.blurb}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-green px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-gold transition hover:bg-green-light"
            >
              See Full Pricing <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green px-4 py-20 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-gold sm:text-4xl">
          Ready to train like a Star?
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-white/80">
          Build athletic performance, a physical and mental advantage, and
          strength of character — in an intense but positive environment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/pricing"
            className="rounded-lg bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-green transition hover:brightness-95"
          >
            Get Started
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-white/40 px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition hover:border-gold hover:text-gold"
          >
            Contact Andrew
          </Link>
        </div>
      </section>
    </main>
  )
}

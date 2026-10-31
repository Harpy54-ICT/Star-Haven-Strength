import type { Metadata } from 'next'
import Link from 'next/link'
import { PILLARS, BIO } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'About | Star Haven Strength',
  description:
    'Andrew Curless, Lead Coach at Star Haven Strength — a Navy veteran merging elite sports performance programming with tactical military discipline.',
}

export default function AboutPage() {
  return (
    <main>
      <section className="bg-charcoal px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
            Meet Your Coach
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
            Andrew Curless
          </h1>
          <p className="mt-2 font-body text-lg text-white/70">
            Lead Coach, Star Haven Strength · U.S. Navy Veteran
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
            Training Philosophy
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-charcoal">
            {BIO}
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-green">
            Core Training Pillars
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-grey-mid bg-grey-light p-6"
              >
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-green">
                  {p.title}
                </h3>
                <p className="mt-2 font-body text-sm text-grey-dark">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
            Train with intent.
          </h2>
          <p className="mt-3 font-body text-grey-dark">
            Explore the coaching tiers and find the level of support that fits
            your goals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/services"
              className="rounded-lg bg-green px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
            >
              View Services
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-green px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-green hover:bg-green hover:text-gold"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

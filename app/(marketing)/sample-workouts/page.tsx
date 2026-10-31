import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SAMPLE_WORKOUTS } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Sample Workouts | Star Haven Strength',
  description:
    'Free, general sample workouts and form guides — mobility routines, a Zero to 5K plan, and lifting technique breakdowns. Train like a Star, feel like a Star.',
}

export default function SampleWorkoutsPage() {
  return (
    <main className="min-h-screen bg-grey-light">
      <section className="bg-green">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-gold">
            Free Resources
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            Sample Workouts
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-white/85">
            A taste of the Star Haven approach — safe, general routines you can
            try today. For a plan tailored to your goals, explore coaching.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {SAMPLE_WORKOUTS.map((w) => (
            <Link
              key={w.slug}
              href={`/sample-workouts/${w.slug}`}
              className="group flex flex-col rounded-xl border border-grey-mid bg-white p-6 transition-all hover:border-gold hover:shadow-lg"
            >
              <p className="font-display text-xs font-bold uppercase tracking-widest text-gold-dark">
                {w.audience}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-charcoal">
                {w.title}
              </h2>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-grey-dark">
                {w.summary}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-green transition-colors group-hover:text-gold-dark">
                View workout
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

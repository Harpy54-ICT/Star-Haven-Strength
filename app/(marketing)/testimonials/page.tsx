import type { Metadata } from 'next'
import Link from 'next/link'
import { Quote } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Testimonials | Star Haven Strength',
  description:
    'Client stories and success stories from Star Haven Strength. Real results from real athletes — coming soon.',
}

const PLACEHOLDERS = [
  'Youth Athlete',
  'Adult / General Fitness',
  'Military & Veteran',
  'Sport-Specific Athlete',
]

export default function TestimonialsPage() {
  return (
    <main>
      <section className="bg-charcoal px-4 py-20 text-center sm:px-6">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Success Stories
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
          Testimonials
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/70">
          Client stories will appear here as athletes share their journeys.
        </p>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">
            {PLACEHOLDERS.map((label) => (
              <div
                key={label}
                className="rounded-xl border border-dashed border-grey-mid bg-white p-6"
              >
                <Quote className="text-gold" size={28} />
                <p className="mt-3 font-body text-base italic text-grey-dark">
                  Testimonial coming soon — client stories will appear here.
                </p>
                <p className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-green">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-grey-mid bg-grey-light p-8 text-center">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-green">
              Have a story to share?
            </h2>
            <p className="mt-2 font-body text-grey-dark">
              Current clients are welcome to submit their experience for this
              page.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-lg bg-green px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
            >
              Share Your Story
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

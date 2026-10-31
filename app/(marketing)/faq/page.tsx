import type { Metadata } from 'next'
import Link from 'next/link'
import FaqAccordion, { type FaqItem } from '@/components/marketing/FaqAccordion'

export const metadata: Metadata = {
  title: 'FAQ | Star Haven Strength',
  description:
    'Answers about coaching tiers, the military discount, cancellation, and how online coaching works at Star Haven Strength.',
}

const FAQS: FaqItem[] = [
  {
    q: 'What coaching tiers do you offer?',
    a: 'There are four tiers — Foundation, Custom, Performance, and Elite — each available for civilians and the military community. Higher tiers add more individualized programming, accountability, and coach access. You can compare them in full on the Pricing page.',
  },
  {
    q: 'How does the military discount work?',
    a: 'Verified military and veteran members receive 20% off for life on any tier. After you create an account you can submit verification; once approved, the discount is applied to your subscription automatically.',
  },
  {
    q: 'Is there a discount for new clients?',
    a: 'New clients may qualify for $50 off per month for their first 3 months. Annual plans also save 15% compared to paying monthly.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can manage or cancel your plan at any time from your dashboard billing settings, which opens the secure Stripe billing portal. Cancellations take effect at the end of your current billing period — there are no long-term contracts.',
  },
  {
    q: 'How does online coaching actually work?',
    a: 'After you subscribe and complete your intake, you get access to a dashboard with your programming and a full logging suite — workouts, cardio, body metrics, nutrition, habits, PRs, check-ins, and more. You communicate with your coach through the platform, and higher tiers include closer accountability and scheduling.',
  },
  {
    q: 'Do I need a gym or special equipment?',
    a: 'Programming is tailored to the equipment you have access to. Many sessions can be done at home or in a standard gym; your coach will design around your setup during intake.',
  },
  {
    q: 'Can I switch tiers later?',
    a: 'Yes. You can upgrade or downgrade between tiers as your goals change. Changes are handled through your billing settings and take effect on your next cycle.',
  },
  {
    q: 'Is coaching appropriate for youth athletes?',
    a: 'Yes. Youth programming emphasizes foundational movement mechanics, coordination, and long-term development with age-appropriate progressions. Always consult your physician before a youth athlete begins a new program.',
  },
]

export default function FaqPage() {
  return (
    <main>
      <section className="bg-charcoal px-4 py-20 text-center sm:px-6">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Questions & Answers
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
          Frequently Asked Questions
        </h1>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={FAQS} />

          <div className="mt-12 rounded-xl border border-grey-mid bg-grey-light p-8 text-center">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-green">
              Still have questions?
            </h2>
            <p className="mt-2 font-body text-grey-dark">
              Reach out and we&apos;ll help you find the right fit.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-lg bg-green px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

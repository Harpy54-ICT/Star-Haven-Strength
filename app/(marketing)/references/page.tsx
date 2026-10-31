import type { Metadata } from 'next'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'References & Sources | Star Haven Strength',
  description:
    'Reputable exercise-science organizations and public health guidelines that inform our coaching approach — NASM, ACSM, NSCA, and the CDC.',
}

interface Reference {
  name: string
  description: string
  url: string
}

const REFERENCES: Reference[] = [
  {
    name: 'National Academy of Sports Medicine (NASM)',
    description:
      'Evidence-based certifications and the OPT model for program design and corrective exercise.',
    url: 'https://www.nasm.org/',
  },
  {
    name: 'American College of Sports Medicine (ACSM)',
    description:
      'Leading authority on sports medicine and exercise science, publishing widely used guidelines for exercise testing and prescription.',
    url: 'https://www.acsm.org/',
  },
  {
    name: 'National Strength and Conditioning Association (NSCA)',
    description:
      'Research-driven standards for strength and conditioning professionals and the Certified Strength and Conditioning Specialist (CSCS) credential.',
    url: 'https://www.nsca.com/',
  },
  {
    name: 'CDC — Physical Activity Basics',
    description:
      'U.S. Centers for Disease Control and Prevention guidance on recommended physical activity for children, adults, and older adults.',
    url: 'https://www.cdc.gov/physical-activity-basics/',
  },
  {
    name: 'Physical Activity Guidelines for Americans (HHS)',
    description:
      'Official U.S. Department of Health and Human Services guidelines on physical activity for all age groups.',
    url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines',
  },
  {
    name: 'World Health Organization — Physical Activity',
    description:
      'Global recommendations on physical activity and sedentary behavior for health.',
    url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
  },
]

export default function ReferencesPage() {
  return (
    <main>
      <section className="bg-charcoal px-4 py-20 text-center sm:px-6">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Evidence-Based Coaching
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
          References & Sources
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/70">
          Our approach is grounded in established exercise-science organizations
          and public health guidelines.
        </p>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {REFERENCES.map((ref) => (
            <a
              key={ref.url}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 rounded-xl border border-grey-mid bg-white p-5 transition hover:border-green hover:shadow"
            >
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-green">
                  {ref.name}
                </h2>
                <p className="mt-1 font-body text-sm text-grey-dark">
                  {ref.description}
                </p>
              </div>
              <ExternalLink
                className="mt-1 shrink-0 text-grey-dark transition group-hover:text-green"
                size={20}
              />
            </a>
          ))}

          <p className="pt-4 text-center font-body text-xs text-grey-dark">
            External links are provided for educational reference and do not
            imply endorsement. Always consult a qualified professional before
            starting a new program.
          </p>
        </div>
      </section>
    </main>
  )
}

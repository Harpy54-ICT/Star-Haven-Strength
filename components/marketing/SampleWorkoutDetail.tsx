import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import YouTubeEmbed from '@/components/marketing/YouTubeEmbed'
import type { SampleWorkout } from '@/lib/marketing/sample-workouts'

/**
 * Shared presentation for a single sample workout. Renders the title, summary,
 * a YouTube embed (placeholder until footage exists), the structured sections,
 * and a mandatory "consult a professional" disclaimer.
 */
export default function SampleWorkoutDetail({
  workout,
}: {
  workout: SampleWorkout
}) {
  return (
    <main className="min-h-screen bg-grey-light">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <Link
          href="/sample-workouts"
          className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-green transition-colors hover:text-gold-dark"
        >
          <ArrowLeft size={16} />
          All sample workouts
        </Link>

        <header className="mt-6">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-gold-dark">
            {workout.audience}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-charcoal">
            {workout.title}
          </h1>
          <p className="mt-4 font-body text-lg leading-relaxed text-grey-dark">
            {workout.summary}
          </p>
        </header>

        <div className="mt-8">
          <YouTubeEmbed videoId={workout.videoId} title={workout.title} />
        </div>

        <div className="mt-10 space-y-8">
          {workout.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-green">
                {section.heading}
              </h2>
              <ul className="mt-3 space-y-2">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 font-body text-base leading-relaxed text-charcoal"
                  >
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Mandatory safety disclaimer */}
        <div className="mt-12 flex gap-3 rounded-xl border border-gold/40 bg-gold/10 p-5">
          <AlertTriangle className="mt-0.5 flex-shrink-0 text-gold-dark" size={20} />
          <p className="font-body text-sm leading-relaxed text-grey-dark">
            <strong className="font-semibold text-charcoal">
              Consult a professional.
            </strong>{' '}
            This content is general educational information, not personalized
            medical or training advice. Talk to your physician before starting
            any new exercise program, and work with a qualified coach to make
            sure these movements are right for you. Stop immediately if you feel
            pain, dizziness, or discomfort.
          </p>
        </div>

        <div className="mt-10 rounded-xl bg-green p-6 text-center">
          <p className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Want a program built for you?
          </p>
          <Link
            href="/services"
            className="mt-4 inline-block rounded-lg bg-gold px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold-dark"
          >
            Explore coaching
          </Link>
        </div>
      </div>
    </main>
  )
}

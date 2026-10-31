import type { ReactNode } from 'react'

/**
 * Shared presentational wrapper for legal/policy pages (privacy, terms, refund,
 * medical disclaimer). Renders a consistent hero, an "effective date" line, the
 * attorney-review notice, and a readable prose body.
 *
 * These templates are provided for convenience and are NOT legal advice.
 */
export default function LegalPage({
  title,
  intro,
  children,
}: {
  title: string
  intro?: string
  children: ReactNode
}) {
  return (
    <main>
      <section className="bg-charcoal px-4 py-16 text-center sm:px-6">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Star Haven Strength
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
          {title}
        </h1>
        {intro && (
          <p className="mx-auto mt-4 max-w-2xl font-body text-base text-white/70">
            {intro}
          </p>
        )}
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-sm text-grey-dark">
            Effective date: [to be set by owner]
          </p>
          <div className="mt-4 rounded-lg border border-gold/50 bg-gold/10 p-4">
            <p className="font-body text-sm text-charcoal">
              This template is provided for convenience and should be reviewed by
              a qualified attorney.
            </p>
          </div>

          <div className="legal-prose mt-8 space-y-6 font-body text-sm leading-relaxed text-charcoal">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}

/** A titled section within a legal page. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold uppercase tracking-wide text-green">
        {heading}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

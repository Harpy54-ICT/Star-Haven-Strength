import Link from 'next/link'

const FOOTER_SECTIONS = [
  {
    title: 'Train',
    links: [
      { label: 'Services', href: '/services' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Sample Workouts', href: '/sample-workouts' },
      { label: 'Challenges', href: '/challenges' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'About', href: '/about' },
      { label: "Coach's Office", href: '/coaches-office' },
      { label: 'References', href: '/references' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Sign In', href: '/login' },
      { label: 'Get Started', href: '/pricing' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Medical Disclaimer', href: '/medical-disclaimer' },
    ],
  },
]

/** Public marketing footer with link columns, tagline, and copyright. */
export default function MarketingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-grey-mid bg-green">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <span className="font-display text-lg font-bold uppercase tracking-wide text-gold">
              Star Haven Strength
            </span>
            <p className="mt-3 font-body text-sm text-white/70">
              Train like a Star, Feel like a Star.
            </p>
            <p className="mt-2 font-body text-xs text-white/50">
              Veteran-owned performance coaching for youth, adults, and the
              military community.
            </p>
          </div>

          {FOOTER_SECTIONS.map((s) => (
            <div key={s.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
                {s.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-body text-sm text-white/70 transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="font-body text-xs text-white/60">
            © {year} Star Haven Strength. All rights reserved. Always consult a
            physician before beginning any new exercise program.
          </p>
        </div>
      </div>
    </footer>
  )
}

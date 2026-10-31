'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/home' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Sample Workouts', href: '/sample-workouts' },
  { label: "Coach's Office", href: '/coaches-office' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

/**
 * Sticky public marketing header: logo, primary nav, and auth CTAs.
 * Responsive — collapses to a hamburger drawer on mobile.
 */
export default function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-grey-mid bg-charcoal/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Star Haven Strength"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="font-display text-lg font-bold uppercase tracking-wide text-gold">
            Star Haven Strength
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-sm font-medium text-white/80 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="font-body text-sm font-semibold text-white/90 hover:text-gold"
          >
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg bg-gold px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-green transition hover:brightness-95"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-white lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-grey-mid bg-charcoal lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 font-body text-sm font-medium text-white/80 hover:bg-white/5 hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3 px-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-center font-body text-sm font-semibold text-white"
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-gold px-4 py-2 text-center font-display text-sm font-bold uppercase tracking-wide text-green"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

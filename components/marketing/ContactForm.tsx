'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

/** Public contact form — posts to /api/contact (Waitlist) with a honeypot. */
export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit = name.trim().length > 0 && emailValid

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) {
      setError('Please enter your name and a valid email.')
      return
    }
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, interest, website }),
      })
      if (res.ok) {
        setStatus('success')
        setName('')
        setEmail('')
        setInterest('')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong.')
        setStatus('error')
      }
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green/30 bg-green/5 p-8 text-center">
        <h3 className="font-display text-xl font-bold uppercase tracking-wide text-green">
          Thanks for reaching out!
        </h3>
        <p className="mt-2 font-body text-grey-dark">
          Your message has been received. Andrew will be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="font-display text-xs font-bold uppercase tracking-wide text-charcoal"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-grey-mid px-3 py-2.5 font-body text-sm focus:border-green focus:outline-none"
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="font-display text-xs font-bold uppercase tracking-wide text-charcoal"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-grey-mid px-3 py-2.5 font-body text-sm focus:border-green focus:outline-none"
          placeholder="you@example.com"
          required
        />
        {email.length > 0 && !emailValid && (
          <p className="mt-1 font-body text-xs text-red-600">
            Please enter a valid email address.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="interest"
          className="font-display text-xs font-bold uppercase tracking-wide text-charcoal"
        >
          How can we help?
        </label>
        <textarea
          id="interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-grey-mid px-3 py-2.5 font-body text-sm focus:border-green focus:outline-none"
          placeholder="Tell us about your goals, your sport, or which tier you're considering."
        />
      </div>

      {/* Honeypot — visually hidden; bots fill it, humans don't. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'submitting' || !canSubmit}
        className="w-full rounded-lg bg-green px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-gold transition hover:bg-green-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

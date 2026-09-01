'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-gold">
            Star Haven
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-green">
            Reset Your Password
          </h1>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="rounded-lg border border-green/30 bg-green/5 px-4 py-6 font-body text-charcoal">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent
              a password reset link. Please check your inbox.
            </div>
            <Link
              href="/login"
              className="inline-block font-medium text-green hover:text-green-light hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center font-body text-sm text-grey-dark">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block font-body text-sm text-grey-dark">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-grey-mid bg-white px-4 py-3 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green py-3 font-display font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-green-light disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
            <p className="mt-6 text-center font-body text-sm text-grey-dark">
              <Link
                href="/login"
                className="font-medium text-green hover:text-green-light hover:underline"
              >
                ← Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}

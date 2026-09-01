'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function passwordStrength(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green']

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = useMemo(() => passwordStrength(password), [password])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Missing reset token. Please use the link from your email.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Could not reset password.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-green/30 bg-green/5 px-4 py-6 font-body text-charcoal">
          Your password has been reset. Redirecting you to login…
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block font-body text-sm text-grey-dark">
            New Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-grey-mid bg-white px-4 py-3 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
          />
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  password && i < strength
                    ? STRENGTH_COLORS[strength - 1]
                    : 'bg-grey-mid'
                }`}
              />
            ))}
          </div>
          {password && (
            <p className="mt-1 text-xs text-grey-dark">
              Strength: {STRENGTH_LABELS[Math.max(strength - 1, 0)]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block font-body text-sm text-grey-dark">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              Resetting...
            </>
          ) : (
            'Reset Password'
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
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-gold">
            Star Haven
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-green">
            Set a New Password
          </h1>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-green" size={28} />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}

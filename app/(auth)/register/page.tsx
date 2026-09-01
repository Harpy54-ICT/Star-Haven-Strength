'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import type { AccountType } from '@/types'

const BRANCHES = [
  'Army',
  'Navy',
  'Marine Corps',
  'Air Force',
  'Space Force',
  'Coast Guard',
  'National Guard',
]

export default function RegisterPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('civilian')
  const [militaryBranch, setMilitaryBranch] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const showBranch = accountType === 'military' || accountType === 'veteran'

  function validateEmail() {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    setFieldErrors((prev) => ({
      ...prev,
      email: ok || !email ? '' : 'Please enter a valid email address',
    }))
  }

  function validateConfirm() {
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword:
        !confirmPassword || confirmPassword === password
          ? ''
          : 'Passwords do not match',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreedToTerms) {
      setError('You must agree to the terms to continue.')
      return
    }
    if (showBranch && !militaryBranch) {
      setError('Please select your branch of service.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          accountType,
          militaryBranch: showBranch ? militaryBranch : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!result || result.error) {
        // Account created but auto sign-in failed — send them to login.
        router.push('/login')
        return
      }

      router.push('/dashboard/onboarding')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-grey-mid bg-white px-4 py-3 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20'

  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-gold">
            Star Haven
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-green">
            Create Your Account
          </h1>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-body text-sm text-grey-dark">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-sm text-grey-dark">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-body text-sm text-grey-dark">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validateEmail}
              className={inputClass}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-body text-sm text-grey-dark">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-grey-dark">
              Must be at least 8 characters.
            </p>
          </div>

          <div>
            <label className="mb-1 block font-body text-sm text-grey-dark">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={validateConfirm}
              className={inputClass}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-body text-sm text-grey-dark">
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className={inputClass}
            >
              <option value="civilian">Civilian</option>
              <option value="military">Active Military</option>
              <option value="veteran">Veteran</option>
            </select>
          </div>

          {showBranch && (
            <div>
              <label className="mb-1 block font-body text-sm text-grey-dark">
                Branch of Service
              </label>
              <select
                value={militaryBranch}
                onChange={(e) => setMilitaryBranch(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a branch…</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-start gap-2 font-body text-sm text-grey-dark">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-grey-mid text-green focus:ring-green"
              required
            />
            <span>
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green py-3 font-display font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-green-light disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-grey-mid" />
          <span className="font-body text-sm text-grey-dark">or</span>
          <div className="h-px flex-1 bg-grey-mid" />
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full rounded-lg border border-grey-mid bg-white py-3 font-body font-medium text-charcoal transition-colors hover:bg-grey-light"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center font-body text-sm text-grey-dark">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-green hover:text-green-light hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}

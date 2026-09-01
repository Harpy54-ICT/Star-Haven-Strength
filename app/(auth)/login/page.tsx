'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (!result || result.error) {
      setError('Invalid email or password. Please try again.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <>
      <div className="mb-8 text-center">
        <span className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-gold">
          Star Haven
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-green">
          Welcome Back
        </h1>
      </div>

      <div>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="peer w-full rounded-lg border border-grey-mid bg-white px-4 pb-2 pt-6 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
            />
            <label
              htmlFor="email"
              className="pointer-events-none absolute left-4 top-4 font-body text-grey-dark transition-all peer-focus:top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full rounded-lg border border-grey-mid bg-white px-4 pb-2 pt-6 pr-12 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
            />
            <label
              htmlFor="password"
              className="pointer-events-none absolute left-4 top-4 font-body text-grey-dark transition-all peer-focus:top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-dark hover:text-charcoal"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="font-body text-sm text-green hover:text-green-light hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green py-3 font-display font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-green-light disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Logging in...
              </>
            ) : (
              'Log In'
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
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full rounded-lg border border-grey-mid bg-white py-3 font-body font-medium text-charcoal transition-colors hover:bg-grey-light"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center font-body text-sm text-grey-dark">
          New to Star Haven?{' '}
          <Link
            href="/register"
            className="font-medium text-green hover:text-green-light hover:underline"
          >
            Start here →
          </Link>
        </p>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-green" size={28} />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}

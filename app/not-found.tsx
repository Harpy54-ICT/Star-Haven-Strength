import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-charcoal px-4 text-center">
      <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
        Star Haven Strength
      </span>
      <p className="mt-6 font-display text-7xl font-extrabold text-gold">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Page Not Found
      </h1>
      <p className="mx-auto mt-3 max-w-md font-body text-sm text-white/70">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/home"
          className="rounded-lg bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold/90"
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/30 px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}

export default function BillingLoading() {
  return (
    <main className="min-h-screen bg-grey-light px-4 py-10">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="mb-6">
          <div className="h-4 w-20 rounded bg-grey-mid" />
          <div className="mt-3 h-8 w-40 rounded bg-grey-mid" />
        </div>

        {/* Current plan skeleton */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="h-5 w-32 rounded bg-grey-mid" />
          <div className="mt-4 h-8 w-48 rounded bg-grey-mid" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="h-12 rounded bg-grey-light" />
            <div className="h-12 rounded bg-grey-light" />
          </div>
          <div className="mt-6 h-12 w-44 rounded-lg bg-grey-mid" />
        </section>

        {/* Invoice history skeleton */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="h-5 w-40 rounded bg-grey-mid" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded bg-grey-light" />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

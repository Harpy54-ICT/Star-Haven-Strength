import Stripe from 'stripe'

/**
 * Shared server-side Stripe client.
 *
 * Reads STRIPE_SECRET_KEY from the environment. The API version is pinned to
 * the version shipped with the installed `stripe` SDK so TypeScript types match
 * the runtime behavior.
 *
 * NOTE: never import this from a client component — it exposes the secret key.
 */
const secretKey = process.env.STRIPE_SECRET_KEY

export const stripe = new Stripe(secretKey ?? '', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  appInfo: {
    name: 'Star Haven Strength',
  },
})

/** Throws a clear error if the Stripe secret key is not configured. */
export function assertStripeConfigured(): void {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to your environment before using Stripe.'
    )
  }
}

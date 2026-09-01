import { z } from 'zod'

/**
 * Environment variable validation.
 *
 * Server variables are validated lazily on first access so that the module can
 * be imported in any runtime (including the Edge middleware) without crashing
 * when a given var is not present in that context. Client variables (prefixed
 * with NEXT_PUBLIC_) are always safe to expose to the browser.
 *
 * Import { serverEnv, clientEnv, isProduction } from '@/lib/env'.
 */

const serverEnvSchema = z.object({
  // Database — Vercel Postgres
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),
  POSTGRES_PRISMA_URL: z.string().min(1, 'POSTGRES_PRISMA_URL is required'),
  POSTGRES_URL_NON_POOLING: z
    .string()
    .min(1, 'POSTGRES_URL_NON_POOLING is required'),

  // Auth.js
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  AUTH_URL: z.string().url().optional(),

  // Google OAuth + service account
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  GOOGLE_ADMIN_CALENDAR_ID: z.string().optional(),

  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Third-party integrations
  RAPIDAPI_KEY: z.string().optional(),
  TERRA_API_KEY: z.string().optional(),
  TERRA_DEV_ID: z.string().optional(),
  TERRA_WEBHOOK_SECRET: z.string().optional(),
  NUTRITIONIX_APP_ID: z.string().optional(),
  NUTRITIONIX_API_KEY: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),

  // Internal secrets
  CRON_SECRET: z.string().optional(),
  ADMIN_SECRET: z.string().optional(),

  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Star Haven'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

/**
 * During `next build`, the app is compiled without a full runtime environment.
 * We skip strict validation at build time to avoid failing the build when
 * deployment secrets are injected only at runtime. Set SKIP_ENV_VALIDATION=1
 * to opt out of validation explicitly (e.g. in CI).
 */
const shouldSkipValidation =
  process.env.SKIP_ENV_VALIDATION === '1' ||
  process.env.NEXT_PHASE === 'phase-production-build'

function formatErrors(error: z.ZodError): string {
  return error.errors
    .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
    .join('\n')
}

let cachedServerEnv: ServerEnv | null = null

/**
 * Validate and return the server-side environment. Throws a descriptive error
 * listing every missing/invalid variable on first access.
 */
export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv

  if (shouldSkipValidation) {
    cachedServerEnv = process.env as unknown as ServerEnv
    return cachedServerEnv
  }

  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(
      `❌ Invalid server environment variables:\n${formatErrors(parsed.error)}`
    )
  }
  cachedServerEnv = parsed.data
  return cachedServerEnv
}

function parseClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  })
  if (!parsed.success) {
    throw new Error(
      `❌ Invalid client environment variables:\n${formatErrors(parsed.error)}`
    )
  }
  return parsed.data
}

/**
 * Lazily-validated server environment. Access as `serverEnv.AUTH_SECRET`.
 */
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    return getServerEnv()[prop as keyof ServerEnv]
  },
})

/** Validated client environment (safe for the browser). */
export const clientEnv = parseClientEnv()

/** True when running in production. */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

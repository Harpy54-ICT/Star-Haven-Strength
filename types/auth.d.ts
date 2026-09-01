/**
 * Auth-related type augmentation.
 *
 * The canonical Auth.js module augmentation (adding `id`, `role`, and
 * `accountType` to `session.user` and the JWT) lives in `types/next-auth.d.ts`
 * to keep all augmentation consolidated in one place and avoid duplicate
 * `declare module` blocks. This file re-exports that module so imports of
 * `@/types/auth` continue to work.
 */
export type { AccountType, UserRole } from '@/types'

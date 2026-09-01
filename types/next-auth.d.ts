import type { DefaultSession } from 'next-auth'
import type { AccountType, UserRole } from '@/types'

/**
 * Module augmentation for Auth.js v5.
 *
 * Adds our custom fields (id, role, accountType) to the session user and to the
 * JWT so they are strongly typed everywhere `auth()` / `useSession()` is used.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      accountType: AccountType
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
    accountType?: AccountType
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
    accountType?: AccountType
  }
}

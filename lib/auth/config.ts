import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import type { AccountType, UserRole } from '@/types'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/**
 * Auth.js v5 configuration.
 *
 * Uses a JWT session strategy so it can run in the Edge middleware. The Prisma
 * adapter persists OAuth accounts/users. Credentials are verified against the
 * bcrypt password hash stored on the User record.
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) {
          // Log the specific reason server-side, return a generic null to client.
          console.warn('[auth] Invalid credentials payload')
          return null
        }

        const { email, password } = parsed.data
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user) {
          console.warn(`[auth] No user found for email: ${email}`)
          return null
        }

        if (!user.passwordHash) {
          console.warn(
            `[auth] User ${user.id} has no password (OAuth-only account)`
          )
          return null
        }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) {
          console.warn(`[auth] Invalid password for user ${user.id}`)
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name:
            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
            user.email,
          image: user.image,
          role: user.role as UserRole,
          accountType: user.accountType as AccountType,
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // No Google Calendar scopes at general sign-in — those are requested
      // separately when the user connects their calendar for bookings.
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'select_account',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: UserRole }).role ?? 'client'
        token.accountType =
          (user as { accountType?: AccountType }).accountType ?? 'civilian'
      } else if (token.id && !token.role) {
        // Hydrate role/accountType for sessions created via OAuth adapter.
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, accountType: true },
        })
        if (dbUser) {
          token.role = dbUser.role as UserRole
          token.accountType = dbUser.accountType as AccountType
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? ''
        session.user.role = (token.role as UserRole) ?? 'client'
        session.user.accountType =
          (token.accountType as AccountType) ?? 'civilian'
      }
      return session
    },
  },
}

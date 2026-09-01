import { auth } from '@/lib/auth'
import type { Session } from 'next-auth'

/**
 * Error thrown by the auth guards. Carries an HTTP status code so API helpers
 * can translate it into the correct response.
 */
export class AuthError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 401) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
  }
}

/**
 * Ensure there is an authenticated session. Returns the session.
 * @throws AuthError (401) if there is no session.
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AuthError('Authentication required', 401)
  }
  return session
}

/**
 * Ensure the current user is an admin. Returns the session.
 * @throws AuthError (401) if unauthenticated, (403) if not an admin.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== 'admin') {
    throw new AuthError('Admin access required', 403)
  }
  return session
}

/**
 * Ensure the current user owns the resource (or is an admin). Returns the session.
 * @throws AuthError (401) if unauthenticated, (403) if not owner and not admin.
 */
export async function requireOwnership(
  resourceUserId: string
): Promise<Session> {
  const session = await requireAuth()
  if (session.user.id !== resourceUserId && session.user.role !== 'admin') {
    throw new AuthError('You do not have access to this resource', 403)
  }
  return session
}

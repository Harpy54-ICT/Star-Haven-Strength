import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton.
 *
 * In development, Next.js clears the Node module cache on every hot reload,
 * which would otherwise create a brand-new PrismaClient (and a new connection
 * pool) on each reload and eventually exhaust the database connections. We cache
 * the client on the global object so it survives hot reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

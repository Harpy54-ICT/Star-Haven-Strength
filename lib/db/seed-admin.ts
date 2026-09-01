/**
 * Promote an existing user to the admin role.
 *
 * Usage:
 *   npx tsx lib/db/seed-admin.ts email@example.com
 *   (or) npm run seed:admin -- email@example.com
 *
 * The user must already exist (register through the app first).
 */
import { db } from '@/lib/db/client'

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Usage: npx tsx lib/db/seed-admin.ts <email>')
    process.exit(1)
  }

  const normalizedEmail = email.toLowerCase()
  const user = await db.user.findUnique({ where: { email: normalizedEmail } })

  if (!user) {
    console.error(`❌ No user found with email: ${normalizedEmail}`)
    process.exit(1)
  }

  if (user.role === 'admin') {
    console.log(`ℹ️  ${normalizedEmail} is already an admin. Nothing to do.`)
    process.exit(0)
  }

  await db.user.update({
    where: { id: user.id },
    data: { role: 'admin' },
  })

  console.log(`✅ ${normalizedEmail} has been promoted to admin.`)
}

main()
  .catch((error) => {
    console.error('❌ Failed to seed admin:', error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

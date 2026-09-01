import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { db } from '@/lib/db/client'

const schema = z.object({ email: z.string().email() })

/**
 * Request a password reset.
 *
 * Always returns success (even if the email is unknown) to avoid leaking which
 * emails have accounts. When a matching user exists, a single-use token is
 * generated and stored; the reset link is logged server-side.
 *
 * TODO: replace the console.log below with a real transactional email once an
 * email provider is configured.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const user = await db.user.findUnique({ where: { email } })

    if (user) {
      const token = randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

      await db.passwordResetToken.create({
        data: { userId: user.id, token, expires },
      })

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.AUTH_URL ??
        'http://localhost:3000'
      const resetLink = `${baseUrl}/reset-password?token=${token}`

      // TODO: send this link via email instead of logging it.
      console.log(`[forgot-password] Reset link for ${email}: ${resetLink}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[forgot-password] Unexpected error:', error)
    return NextResponse.json({ success: true })
  }
}

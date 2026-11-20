import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit'

const schema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/**
 * Complete a password reset using a single-use token.
 */
export async function POST(req: Request) {
  try {
    // Limit reset attempts per IP to slow token-guessing.
    const limited = await enforceRateLimit({
      action: 'reset-password',
      identifier: getClientIp(req),
      limit: 10,
      windowSeconds: 60 * 15,
    })
    if (limited) return limited

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.usedAt || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[reset-password] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

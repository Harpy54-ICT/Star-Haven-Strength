import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import type { AccountType } from '@/types'

const REFERRAL_COOKIE = 'star_haven_referral'

/**
 * Attach a referral to a newly registered user, if a valid referral code was
 * captured in the `star_haven_referral` cookie (set by middleware from `?ref=`).
 * Best-effort: registration must never fail because of referral bookkeeping.
 */
async function attachReferral(newUserId: string): Promise<void> {
  try {
    const code = cookies().get(REFERRAL_COOKIE)?.value
    if (!code) return

    const referralCode = await db.referralCode.findUnique({ where: { code } })
    // Ignore unknown codes and self-referrals.
    if (!referralCode || referralCode.userId === newUserId) return

    await db.referral.create({
      data: {
        referrerId: referralCode.userId,
        refereeId: newUserId,
        referralCode: code,
        status: 'converted',
        convertedAt: new Date(),
      },
    })
  } catch (e) {
    console.error('[register] referral attach failed:', e)
  }
}

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('A valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    accountType: z.enum(['civilian', 'military', 'veteran']),
    militaryBranch: z.string().optional(),
  })
  .refine(
    (data) =>
      data.accountType === 'civilian' ? true : !!data.militaryBranch,
    {
      message: 'Military branch is required for military/veteran accounts',
      path: ['militaryBranch'],
    }
  )

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, password, accountType, militaryBranch } =
      parsed.data
    const normalizedEmail = email.toLowerCase()

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        accountType: accountType as AccountType,
        militaryBranch:
          accountType === 'civilian' ? null : militaryBranch ?? null,
      },
      select: { id: true, email: true },
    })

    // Tie the new account to a referrer if a referral code was captured.
    await attachReferral(user.id)

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('[register] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

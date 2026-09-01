import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import type { AccountType } from '@/types'

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

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('[register] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

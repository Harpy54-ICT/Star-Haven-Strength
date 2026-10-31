import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'

/**
 * Public contact / waitlist endpoint.
 *
 * Saves the submission to the Waitlist model. Includes a honeypot field
 * (`website`) — real users never fill it, bots often do; filled = silently
 * accepted but discarded. No email is sent.
 */
export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('A valid email is required').max(200),
  interest: z.string().max(2000).optional().nullable(),
  // Honeypot — must be empty.
  website: z.string().optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const { name, email, interest, website } = parsed.data

  // Honeypot tripped: pretend success, store nothing.
  if (website && website.trim().length > 0) {
    return NextResponse.json({ success: true })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    await db.waitlist.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        name: name.trim(),
        interest: interest?.trim() || null,
      },
      update: {
        name: name.trim(),
        interest: interest?.trim() || null,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Failed to save submission:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

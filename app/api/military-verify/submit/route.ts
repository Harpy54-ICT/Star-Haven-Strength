import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

const MAX_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png']

/**
 * POST /api/military-verify/submit
 *
 * Accepts a multipart form with the verification document, uploads it to Vercel
 * Blob, and creates a pending MilitaryVerification record.
 *
 * NOTE on privacy: the installed @vercel/blob SDK only supports
 * `access: 'public'`. We therefore store the file with an unguessable,
 * random-suffixed pathname under a per-user prefix so the URL cannot be
 * enumerated. Admin-only routes read these records; the raw URL is never
 * exposed to other clients.
 */
export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const form = await req.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  const branch = (form.get('branch') as string | null)?.trim() || null
  const notes = (form.get('notes') as string | null)?.trim() || null

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'A document file is required' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'The uploaded file is empty' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds the 10MB limit' },
      { status: 400 }
    )
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only PDF, JPG, or PNG files are allowed' },
      { status: 400 }
    )
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'File storage is not configured. Please contact support.' },
      { status: 503 }
    )
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `military-verifications/${userId}/${Date.now()}-${safeName}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  })

  // Update the user's branch if supplied and not already set.
  if (branch) {
    await db.user.update({
      where: { id: userId },
      data: { militaryBranch: branch },
    })
  }

  const record = await db.militaryVerification.create({
    data: {
      userId,
      documentUrl: blob.url,
      notes,
      status: 'pending',
    },
    select: { id: true },
  })

  return NextResponse.json({ success: true, id: record.id })
})

import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { db } from '@/lib/db/client'
import { requireAuth, requireOwnership } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

const MAX_BYTES = 15 * 1024 * 1024 // 15MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

/**
 * Progress photos API.
 *
 * Privacy note: the installed @vercel/blob SDK only supports `access: 'public'`.
 * Photos are therefore stored under an unguessable, random-suffixed pathname in
 * a per-user prefix so the URL cannot be enumerated. The URL is only ever
 * returned to the owning user (or an admin) via these guarded routes.
 */

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const form = await req.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  const notes = (form.get('notes') as string | null)?.trim() || null
  const takenAtRaw = (form.get('takenAt') as string | null)?.trim()

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'A photo file is required' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'The uploaded file is empty' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Photo exceeds the 15MB limit' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPG, PNG, WEBP or HEIC images are allowed' },
      { status: 400 }
    )
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'File storage is not configured. Please contact support.' },
      { status: 503 }
    )
  }

  const takenAt = takenAtRaw ? new Date(takenAtRaw) : new Date()
  takenAt.setUTCHours(0, 0, 0, 0)
  if (Number.isNaN(takenAt.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `progress-photos/${userId}/${Date.now()}-${safeName}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  })

  const record = await db.progressPhoto.create({
    data: {
      userId,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      notes,
      takenAt,
    },
    select: { id: true, blobUrl: true },
  })

  return NextResponse.json({ id: record.id, blobUrl: record.blobUrl })
})

export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const photos = await db.progressPhoto.findMany({
    where: { userId },
    orderBy: { takenAt: 'desc' },
  })

  return NextResponse.json({ photos })
})

export const DELETE = withAuth(async (req: Request) => {
  await requireAuth()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Photo id is required' }, { status: 400 })
  }

  const photo = await db.progressPhoto.findUnique({ where: { id } })
  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  // Ensures the caller owns the photo (or is an admin).
  await requireOwnership(photo.userId)

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(photo.blobUrl).catch((e) => {
      console.error('[progress-photos] blob delete failed:', e)
    })
  }

  await db.progressPhoto.delete({ where: { id } })

  return NextResponse.json({ success: true })
})

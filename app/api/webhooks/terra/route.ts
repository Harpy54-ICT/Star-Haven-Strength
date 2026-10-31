import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Terra wearables webhook — STUB.
 *
 * Terra (https://tryterra.co) posts health/activity payloads here. This handler
 * verifies the signature, logs the payload and returns 200. It does not yet
 * persist or act on the data.
 *
 * Signature verification (per Terra docs): the `terra-signature` header has the
 * form `t=<timestamp>,v1=<hmac>` where the HMAC is
 * HMAC-SHA256(`<timestamp>.<rawBody>`) keyed with TERRA_WEBHOOK_SECRET (the
 * "signing secret"). If TERRA_WEBHOOK_SECRET is unset we skip verification and
 * log a warning so local/stub development still works.
 *
 * TODO: confirm the exact header name/format against the live Terra dashboard
 * (Terra has used `terra-signature`); wire real persistence once wearables are
 * in scope.
 */

function verifyTerraSignature(
  rawBody: string,
  header: string | null,
  secret: string
): boolean {
  if (!header) return false
  // Parse `t=...,v1=...`
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const [k, v] = kv.split('=')
      return [k?.trim(), v?.trim()]
    })
  ) as { t?: string; v1?: string }

  const signedPayload =
    parts.t != null ? `${parts.t}.${rawBody}` : rawBody
  const expected = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')
  const provided = parts.v1 ?? header

  try {
    const a = Buffer.from(expected)
    const b = Buffer.from(provided)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const secret = process.env.TERRA_WEBHOOK_SECRET

  if (secret) {
    const signature = req.headers.get('terra-signature')
    if (!verifyTerraSignature(rawBody, signature, secret)) {
      console.error('[terra] signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else {
    console.warn(
      '[terra] TERRA_WEBHOOK_SECRET not set — skipping signature verification (stub mode)'
    )
  }

  let payload: unknown = null
  try {
    payload = rawBody ? JSON.parse(rawBody) : null
  } catch {
    payload = rawBody
  }

  const type =
    payload && typeof payload === 'object' && 'type' in payload
      ? (payload as { type?: unknown }).type
      : undefined
  console.log('[terra] webhook received', { type })

  // TODO: persist/act on the payload once wearables integration is in scope.
  return NextResponse.json({ received: true })
}

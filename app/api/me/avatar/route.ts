import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

const MAX_DATA_URL_BYTES = 60_000 // ~45KB binary; fits MySQL TEXT (65,535 bytes)
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

export async function PUT(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json().catch(() => ({}))
  const dataUrl = body?.dataUrl

  if (dataUrl === null) {
    await db.update(users).set({ image: null }).where(eq(users.id, userId))
    return NextResponse.json({ ok: true, image: null })
  }

  if (typeof dataUrl !== 'string') {
    return NextResponse.json({ error: 'dataUrl must be string or null' }, { status: 400 })
  }
  if (dataUrl.length > MAX_DATA_URL_BYTES) {
    return NextResponse.json({ error: 'avatar too large — resize before upload' }, { status: 413 })
  }
  const mimeMatch = /^data:(image\/(?:jpeg|png|webp));base64,/.exec(dataUrl)
  if (!mimeMatch || !ALLOWED_MIME.includes(mimeMatch[1])) {
    return NextResponse.json({ error: 'invalid image data url' }, { status: 400 })
  }

  await db.update(users).set({ image: dataUrl }).where(eq(users.id, userId))
  return NextResponse.json({ ok: true })
}

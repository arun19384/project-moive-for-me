import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { genres } from '@/lib/schema'

export async function GET() {
  const all = await db.select().from(genres).orderBy(genres.name)
  return NextResponse.json(all)
}

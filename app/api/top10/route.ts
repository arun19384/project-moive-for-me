import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { userTop10 } from '@/lib/schema'
import { auth } from '@/auth'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items = await db
      .select()
      .from(userTop10)
      .where(eq(userTop10.userId, session.userId))

    const lists = {
      movie: Array(10).fill(null),
      series: Array(10).fill(null),
      anime: Array(10).fill(null),
    }

    for (const item of items) {
      if (lists[item.listType]) {
        lists[item.listType][item.position] = item.titleId
      }
    }

    return NextResponse.json(lists)
  } catch (error) {
    console.error('Failed to get top 10:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { listType, list } = await req.json()
    
    if (!['movie', 'series', 'anime'].includes(listType)) {
      return NextResponse.json({ error: 'Invalid list type' }, { status: 400 })
    }
    if (!Array.isArray(list) || list.length !== 10) {
      return NextResponse.json({ error: 'Invalid list format' }, { status: 400 })
    }

    // Delete existing items for this user and listType
    await db
      .delete(userTop10)
      .where(
        and(
          eq(userTop10.userId, session.userId),
          eq(userTop10.listType, listType)
        )
      )

    // Insert new items
    const inserts = list
      .map((titleId, position) => {
        if (titleId == null) return null
        return {
          userId: session.userId,
          listType,
          position,
          titleId,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    if (inserts.length > 0) {
      await db.insert(userTop10).values(inserts)
    }

    revalidatePath('/stats')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save top 10:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getShelfDetail } from '@/lib/shelves'
import ShelfDetailClient from './ShelfDetailClient'

export const dynamic = 'force-dynamic'

export default async function ShelfDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.userId) redirect('/signin')

  const { id } = await params
  const shelfId = Number(id)
  const detail = await getShelfDetail(shelfId, session.userId)

  if (!detail) {
    return (
      <div className="pt-12">
        <Link href="/collections" className="flex items-center gap-1 text-sm mb-4" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={18} /> Collections
        </Link>
        <p className="text-base font-semibold dy-text">Shelf not found</p>
      </div>
    )
  }

  return <ShelfDetailClient initial={detail} />
}

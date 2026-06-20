import { auth } from '@/auth'
import { getTitleDetail } from '@/lib/title'
import TitleDetailClient from './TitleDetailClient'

export const dynamic = 'force-dynamic'

export default async function TitleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = session?.userId ?? null
  const { id } = await params
  const titleId = Number(id)

  if (!userId) {
    return <TitleDetailClient mode="guest" initial={null} titleId={titleId} />
  }

  const detail = await getTitleDetail(titleId, userId)
  return <TitleDetailClient mode="signed-in" initial={detail} titleId={titleId} />
}

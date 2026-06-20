import { auth } from '@/auth'
import { Suspense } from 'react'
import AddClient from './AddClient'

export const dynamic = 'force-dynamic'

export default async function AddPage() {
  const session = await auth()
  const mode = session?.userId ? 'signed-in' : 'guest'
  return (
    <Suspense fallback={null}>
      <AddClient mode={mode} />
    </Suspense>
  )
}

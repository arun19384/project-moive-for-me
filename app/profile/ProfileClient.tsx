'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Save, Trash2 } from 'lucide-react'

type Profile = {
  id: string
  email: string | null
  name: string | null
  image: string | null
  username: string | null
  bio: string | null
  createdAt: string | null
}

const MAX_AVATAR_SIZE = 256 // resize to 256x256 max
const JPEG_QUALITY = 0.78

async function fileToResizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(MAX_AVATAR_SIZE / bitmap.width, MAX_AVATAR_SIZE / bitmap.height, 1)
  const w = Math.round(bitmap.width * ratio)
  const h = Math.round(bitmap.height * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unsupported')
  ctx.drawImage(bitmap, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

export default function ProfileClient({ initial }: { initial: Profile }) {
  const router = useRouter()
  const [name, setName] = useState(initial.name ?? '')
  const [username, setUsername] = useState(initial.username ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
  const [image, setImage] = useState<string | null>(initial.image)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMsg({ text: 'ต้องเป็นไฟล์รูปภาพ', ok: false })
      return
    }
    setUploading(true)
    setMsg(null)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      const res = await fetch('/api/me/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error ?? 'upload failed')
      }
      setImage(dataUrl)
      setMsg({ text: 'อัพโหลดรูปสำเร็จ', ok: true })
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'upload failed', ok: false })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveImage() {
    if (!confirm('ลบรูปโปรไฟล์?')) return
    setUploading(true)
    setMsg(null)
    const res = await fetch('/api/me/avatar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: null }),
    })
    setUploading(false)
    if (res.ok) {
      setImage(null)
      setMsg({ text: 'ลบรูปแล้ว', ok: true })
    } else {
      setMsg({ text: 'ลบรูปไม่สำเร็จ', ok: false })
    }
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    const patch: Record<string, string | null> = {}
    if (name.trim() !== (initial.name ?? '')) patch.name = name.trim() || null
    if (username.trim() !== (initial.username ?? '')) patch.username = username.trim().toLowerCase()
    if (bio.trim() !== (initial.bio ?? '')) patch.bio = bio.trim() || null

    if (Object.keys(patch).length === 0) {
      setSaving(false)
      setMsg({ text: 'ไม่มีอะไรเปลี่ยน', ok: true })
      return
    }

    const res = await fetch('/api/me/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setSaving(false)
    if (res.ok) {
      setMsg({ text: 'บันทึกสำเร็จ', ok: true })
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      setMsg({ text: err?.error ?? 'บันทึกไม่สำเร็จ', ok: false })
    }
  }

  const initial1 = (username || name || initial.email || '?')[0]?.toUpperCase()

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between pt-12 pb-6">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-base font-bold dy-text">Profile</h1>
        <div style={{ width: 56 }} />
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="avatar"
              className="w-28 h-28 rounded-full object-cover"
              style={{ border: '3px solid #C9A84C', boxShadow: '0 8px 24px rgba(201,168,76,0.25)' }} />
          ) : (
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold"
              style={{ background: '#C9A84C', color: '#0D0D0D', border: '3px solid #C9A84C' }}>
              {initial1}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: '#C9A84C', color: '#0D0D0D', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', opacity: uploading ? 0.6 : 1 }}
          >
            <Camera size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
        </div>
        {image && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="mt-3 text-xs flex items-center gap-1"
            style={{ color: 'var(--dim)' }}
          >
            <Trash2 size={12} /> ลบรูป
          </button>
        )}
        <p className="text-xs mt-3" style={{ color: 'var(--faint)' }}>{initial.email}</p>
      </div>

      <div className="space-y-4">
        <Field label="ชื่อ (display name)">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={255}
            className="w-full rounded-xl px-4 py-3 text-sm dy-text outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          />
        </Field>

        <Field label="Username" hint="a-z, 0-9, _, - · 3-30 ตัวอักษร · ใช้สำหรับ /u/[username] ในอนาคต">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="username"
            pattern="[a-z0-9_\-]{3,30}"
            minLength={3}
            maxLength={30}
            className="w-full rounded-xl px-4 py-3 text-sm dy-text outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          />
        </Field>

        <Field label="Bio" hint="optional">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A bit about yourself..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm dy-text outline-none resize-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          />
        </Field>
      </div>

      {msg && (
        <p className="text-xs mt-4 text-center" style={{ color: msg.ok ? '#7FB5FF' : '#ff6b6b' }}>
          {msg.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-opacity"
        style={{ background: '#C9A84C', color: '#0D0D0D', opacity: saving ? 0.6 : 1 }}
      >
        <Save size={16} />
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span style={{ color: 'var(--soft)', fontSize: 14, fontWeight: 600 }}>{label}</span>
        {hint && <span style={{ color: 'var(--faint)', fontSize: 11 }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

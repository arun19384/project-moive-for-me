'use client'

interface GenreTagProps {
  label: string
  selected: boolean
  onClick: () => void
}

export default function GenreTag({ label, selected, onClick }: GenreTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
      style={{
        background: selected ? '#C9A84C' : 'var(--surface)',
        color: selected ? '#0D0D0D' : 'var(--dim)',
        border: `1px solid ${selected ? '#C9A84C' : 'var(--border-strong)'}`,
      }}
    >
      {label}
    </button>
  )
}

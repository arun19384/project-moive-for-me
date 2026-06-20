'use client'

interface RatingInputProps {
  value: number
  onChange: (v: number) => void
}

export default function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="w-6 h-6 rounded border transition-colors"
          style={{
            background: n <= value ? '#C9A84C' : 'transparent',
            borderColor: n <= value ? '#C9A84C' : 'var(--faintest)',
          }}
          aria-label={`Rate ${n}`}
        />
      ))}
      <span className="ml-2 text-base font-bold" style={{ color: '#C9A84C' }}>
        {value > 0 ? value : '—'}
      </span>
    </div>
  )
}

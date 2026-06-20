'use client'

const EMOJIS = ['🍿', '🎬', '🎞️', '🎥', '🎟️', '🎭', '🍿', '🎬']

// Pre-computed drift positions/timings so we don't re-randomize on every render.
const DRIFTS = [
  { left: '5%',  top: '8%',  size: 56, dur: 22, delay: 0,   x: 30,  y: 40 },
  { left: '82%', top: '12%', size: 44, dur: 28, delay: 3,   x: -40, y: 35 },
  { left: '18%', top: '70%', size: 52, dur: 26, delay: 6,   x: 25,  y: -45 },
  { left: '70%', top: '78%', size: 48, dur: 24, delay: 1,   x: -35, y: -30 },
  { left: '42%', top: '4%',  size: 38, dur: 30, delay: 9,   x: 20,  y: 50 },
  { left: '90%', top: '48%', size: 60, dur: 32, delay: 4,   x: -30, y: -25 },
  { left: '2%',  top: '42%', size: 46, dur: 27, delay: 11,  x: 40,  y: -20 },
  { left: '54%', top: '88%', size: 42, dur: 25, delay: 7,   x: -25, y: -40 },
]

export default function CinemaBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at top, #1a1410 0%, #0D0D0D 60%)' }}
    >
      {DRIFTS.map((d, i) => (
        <span
          key={i}
          className="absolute select-none cinema-drift"
          style={{
            left: d.left,
            top: d.top,
            fontSize: d.size,
            opacity: 0.12,
            filter: 'blur(0.5px)',
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
            ['--dx' as string]: `${d.x}px`,
            ['--dy' as string]: `${d.y}px`,
          }}
        >
          {EMOJIS[i % EMOJIS.length]}
        </span>
      ))}
      <style>{`
        @keyframes cinema-drift {
          0%   { transform: translate(0, 0) rotate(0deg); }
          50%  { transform: translate(var(--dx), var(--dy)) rotate(8deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .cinema-drift {
          animation-name: cinema-drift;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          will-change: transform;
        }
      `}</style>
    </div>
  )
}

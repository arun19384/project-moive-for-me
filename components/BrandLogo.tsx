/* eslint-disable @next/next/no-img-element */
export default function BrandLogo({ subtitle = 'ดูยัง?' }: { subtitle?: string }) {
  return (
    <div className="text-center mb-10 relative z-10">
      <img
        src="/icon.png"
        alt="Do young"
        className="w-16 h-16 rounded-2xl mb-3 mx-auto"
        style={{ boxShadow: '0 10px 30px rgba(201,168,76,0.25)' }}
      />
      <h1 className="font-serif text-5xl text-[#C9A84C]" style={{ textShadow: '0 2px 12px rgba(201,168,76,0.3)' }}>
        Do young
      </h1>
      <p className="text-[#888] text-sm mt-1">{subtitle}</p>
    </div>
  )
}

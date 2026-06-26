import React, { useEffect, useRef, useState } from 'react'

// ── TODO: Replace these placeholder values with REAL numbers before going live.
// Do NOT publish invented traction figures. Use honest numbers, even if small.
// See redesign plan Section 6 for guidance.
const STATS = [
  {
    value: '3',
    label: 'Institution types supported',
    caption: 'Schools · Coaching · Colleges',
    // TODO: update to real onboarded-institution count once you have it
  },
  {
    value: '99.9%',
    label: 'Uptime guaranteed',
    caption: 'Monitored continuously',
  },
  {
    value: '2 hrs',
    label: 'Saved per day',
    caption: 'Average admin time saved per staff',
    // TODO: validate with real pilot data before publishing
  },
  {
    value: '24/7',
    label: 'Support availability',
    caption: 'Onboarding + ongoing help',
  },
]

const StatCard: React.FC<{ value: string; label: string; caption: string }> = ({
  value, label, caption,
}) => {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`
        text-center p-6 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm
        hover:border-[#5B3EF544] hover:bg-[#5B3EF508] hover:shadow-[0_0_30px_rgba(91,62,245,0.1)]
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transition: 'opacity 0.6s ease, transform 0.6s ease, border-color 0.3s, background 0.3s, box-shadow 0.3s' }}
    >
      <div className="font-syne font-extrabold text-[clamp(2rem,3.5vw,2.8rem)] text-[#7B61FF] mb-1 leading-none">
        {value}
      </div>
      <div className="text-white font-semibold text-[0.9rem] mb-1">{label}</div>
      <div className="text-white/35 text-[0.72rem] font-dm">{caption}</div>
    </div>
  )
}

const TrustStrip: React.FC = () => (
  <section className="py-16 px-6 lg:px-[60px] bg-gradient-to-r from-[#13104A] to-[#1a1646]">
    <div className="max-w-5xl mx-auto">
      <p className="text-center text-white/30 text-[0.72rem] font-bold uppercase tracking-[0.12em] mb-8">
        What Charronix delivers
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  </section>
)

export default TrustStrip

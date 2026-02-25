import React, { useEffect, useRef, useState } from 'react'

const stats = [
  { label: 'Schools Trusted', value: 500, suffix: '+' },
  { label: 'Students Managed', value: 1000000, suffix: 'M+', isM: true },
  { label: 'Uptime Guaranteed', value: 99.9, suffix: '%', decimal: true },
  { label: 'Dedicated Support', value: 24, suffix: '/7' },
]

const StatCard: React.FC<{ label: string; value: number; suffix: string; isM?: boolean; decimal?: boolean }> = ({ label, value, suffix, isM, decimal }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0
        const duration = 1500
        const startTime = Date.now()

        const frame = () => {
          const progress = Math.min((Date.now() - startTime) / duration, 1)
          const currentVal = isM ? 1 : progress * value

          if (decimal) {
            setCount(Number((progress * value).toFixed(1)))
          } else {
            setCount(Math.floor(currentVal))
          }

          if (progress < 1) requestAnimationFrame(frame)
        }
        requestAnimationFrame(frame)
        observer.disconnect()
      }
    }, { threshold: 0.5 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, isM, decimal])

  return (
    <div ref={ref} className="text-center animate-fade-up">
      <div className="font-syne font-extrabold text-[clamp(2.5rem,4vw,3.5rem)] text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-[0.8rem] text-white/50 font-bold uppercase tracking-[0.1em]">
        {label}
      </div>
    </div>
  )
}

const StatsBanner: React.FC = () => (
  <section className="bg-gradient-to-r from-[#2D2278] to-[#1E1B4B] py-20 lg:py-[80px] px-6 lg:px-[60px] grid grid-cols-2 lg:grid-cols-4 gap-10">
    {stats.map(s => <StatCard key={s.label} {...s} />)}
  </section>
)

export default StatsBanner

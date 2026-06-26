import React, { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck,
  CalendarCheck,
  GraduationCap,
  Clock,
  AlertTriangle,
  BellRing,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import CardSwap, { Card } from './CardSwap'

const features = [
  {
    title: 'Academic Excellence',
    desc: 'Digital report cards, GPA calculation, and comprehensive exam management.',
    icon: GraduationCap,
  },
  {
    title: 'Automated Timetables',
    desc: 'Intelligent scheduling based on teacher availability and room capacity.',
    icon: Clock,
  },
  {
    title: 'Early Warning System',
    desc: 'AI flags at-risk students weeks in advance — giving teachers time to act before it\'s too late.',
    icon: AlertTriangle,
  },
  {
    title: 'Secure Role Management',
    desc: 'Advanced RBAC with role-based views for Admin, Teachers, Students, and Parents.',
    icon: ShieldCheck,
  },
  {
    title: 'Attendance Analytics',
    desc: 'Daily tracking with automated statistics, QR-code boarding, and term-wise reporting.',
    icon: CalendarCheck,
  },
  {
    title: 'Smart Notifications',
    desc: 'Centralised hub for urgent announcements, circulars, and custom alerts.',
    icon: BellRing,
  },
]

const FeaturesSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.1 })

    const reveals = containerRef.current?.querySelectorAll('.reveal')
    reveals?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={containerRef} className="py-[120px] px-6 lg:px-[60px] relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* Left — content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#5B3EF512] border border-[#5B3EF522] py-2 px-4 rounded-full text-[#7B61FF] text-sm font-semibold reveal">
            <Zap size={14} className="fill-[#7B61FF]" />
            Cutting-Edge Features
          </div>

          <h2 className="font-syne font-extrabold text-[clamp(2.5rem,5vw,3.5rem)] text-white leading-[1.1] tracking-tight reveal">
            Everything your institution <br />
            <span className="text-[#7B61FF]">ever needed.</span>
          </h2>

          <p className="text-white/60 text-[1.1rem] leading-[1.8] max-w-[500px] font-dm reveal">
            Charronix isn't just a management tool — it's a complete ecosystem
            engineered to elevate every school, coaching centre, and college.
          </p>

          {/* Pagination dots — Bug 3 fix */}
          <div className="flex items-center gap-3 pt-2 reveal" aria-label="Feature navigation">
            <button
              aria-label="Previous feature"
              onClick={() => setActiveIndex(prev => (prev - 1 + features.length) % features.length)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
            >
              <ChevronLeft size={14} className="text-white/60" />
            </button>

            <div className="flex gap-2">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Show feature: ${features[i].title}`}
                  className={`transition-all duration-300 rounded-full ${
                    i === activeIndex
                      ? 'w-6 h-2 bg-[#7B61FF]'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              aria-label="Next feature"
              onClick={() => setActiveIndex(prev => (prev + 1) % features.length)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
            >
              <ChevronRight size={14} className="text-white/60" />
            </button>

            <span className="text-white/30 text-xs ml-1 font-dm">
              {activeIndex + 1} / {features.length}
            </span>
          </div>

          {/* Active card title preview below dots */}
          <div className="text-white/50 text-sm font-medium font-dm transition-all duration-300">
            Now showing: <span className="text-[#7B61FF] font-semibold">{features[activeIndex].title}</span>
          </div>
        </div>

        {/* Right — Card Swap with pause-on-hover */}
        <div className="flex flex-col items-center gap-6 reveal lg:translate-x-12">
          <CardSwap
            width={480}
            height={380}
            cardDistance={40}
            verticalDistance={50}
            delay={4000}
            pauseOnHover={true}
            easing="smooth"
            onActiveChange={(i) => setActiveIndex(i)}
          >
            {features.map((f) => (
              <Card key={f.title}>
                <div className="card-icon">
                  <f.icon className="w-8 h-8 text-[#7B61FF]" />
                </div>
                <h3 className="card-title">{f.title}</h3>
                <p className="card-desc">{f.desc}</p>
              </Card>
            ))}
          </CardSwap>

          <p className="text-white/25 text-xs font-dm text-center">
            Hover the cards to pause · Click dots to navigate
          </p>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5B3EF508] blur-[120px] rounded-full -z-10" />
    </section>
  )
}

export default FeaturesSection

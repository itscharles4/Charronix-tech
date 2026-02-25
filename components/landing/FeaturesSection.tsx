import React, { useEffect, useRef } from 'react'
import {
  ShieldCheck,
  CalendarCheck,
  GraduationCap,
  Clock,
  Sparkles,
  BellRing,
  Zap
} from 'lucide-react'
import CardSwap, { Card } from './CardSwap'

const features = [
  {
    title: 'Secure Role Management',
    desc: 'Advanced RBAC ensuring secure access for Admin, Teachers, Students, and Parents.',
    icon: ShieldCheck,
  },
  {
    title: 'Attendance Analytics',
    desc: 'Daily tracking with automated statistics and term-wise reporting.',
    icon: CalendarCheck
  },
  {
    title: 'Academic Excellence',
    desc: 'Digital report cards, GPA calculation, and comprehensive exam management.',
    icon: GraduationCap
  },
  {
    title: 'Automated Timetables',
    desc: 'Intelligent scheduling algorithms based on teacher and room availability.',
    icon: Clock
  },
  {
    title: 'AI Dashboard Insights',
    desc: 'Predictive performance trends and smart highlights driven by Gemini AI.',
    icon: Sparkles
  },
  {
    title: 'Smart Notifications',
    desc: 'Centralized hub for urgent school announcements and custom alerts.',
    icon: BellRing
  },
]

const FeaturesSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    const reveals = containerRef.current?.querySelectorAll('.reveal')
    reveals?.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={containerRef} className="py-[120px] px-6 lg:px-[60px] relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* Left Side: Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#5B3EF512] border border-[#5B3EF522] py-2 px-4 rounded-full text-[#7B61FF] text-sm font-semibold reveal">
            <Zap size={14} className="fill-[#7B61FF]" />
            Cutting Edge Features
          </div>

          <h2 className="font-syne font-extrabold text-[clamp(2.5rem,5vw,3.5rem)] text-white leading-[1.1] tracking-tight reveal">
            Everything your school <br />
            <span className="text-[#7B61FF]">ever needed.</span>
          </h2>

          <p className="text-white/60 text-[1.1rem] leading-[1.8] max-w-[500px] font-dm reveal">
            Charronix isn't just a management tool—it's a complete ecosystem engineered to elevate the educational experience through technology.
          </p>
        </div>

        {/* Right Side: Card Swap */}
        <div className="flex justify-center items-center reveal lg:translate-x-12">
          <CardSwap
            width={480}
            height={380}
            cardDistance={40}
            verticalDistance={50}
            delay={4000}
            pauseOnHover={true}
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
        </div>

      </div>

      {/* Background Decorative Element */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5B3EF508] blur-[120px] rounded-full -z-10"></div>
    </section>
  )
}

export default FeaturesSection

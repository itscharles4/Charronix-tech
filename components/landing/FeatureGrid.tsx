import React, { useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  UserCheck,
  CalendarCheck,
  IndianRupee,
  GraduationCap,
  MessageCircle,
  Bus,
  AlertTriangle,
  Building2,
} from 'lucide-react'

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Unified Dashboard',
    desc: 'One login for admins, teachers, students and parents — role-based views for everyone.',
  },
  {
    icon: UserCheck,
    title: 'Admissions & Enrollment',
    desc: 'Digital admission forms, enquiry tracking, and automated follow-ups.',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance & Timetables',
    desc: 'Smart scheduling and automated attendance — QR-code, app or manual.',
  },
  {
    icon: IndianRupee,
    title: 'Fees & Finance',
    desc: 'Online payments, automated reminders, and real-time collection reports.',
  },
  {
    icon: GraduationCap,
    title: 'Exams & Results',
    desc: 'Exam scheduling, auto-grading, and downloadable report cards.',
  },
  {
    icon: MessageCircle,
    title: 'Parent Communication',
    desc: 'Real-time updates, circulars and alerts via app, SMS and email.',
  },
  {
    icon: Bus,
    title: 'Transport Tracking',
    desc: 'QR-code boarding, live GPS tracking, and instant parent SMS alerts.',
  },
  {
    icon: AlertTriangle,
    title: 'Early Warning System',
    desc: 'AI flags at-risk students weeks in advance — giving teachers and parents time to act.',
  },
  {
    icon: Building2,
    title: 'Multi-Branch Support',
    desc: 'Manage multiple campuses, branches or batches from a single control centre.',
  },
]

const FeatureGrid: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.05 })

    const reveals = ref.current?.querySelectorAll('.reveal')
    reveals?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="feature-grid" className="py-[100px] px-6 lg:px-[60px] bg-[#0F0D2E]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3rem)] text-white tracking-tight mb-3">
            Everything your institution needs
          </h2>
          <p className="text-white/50 text-[1rem] font-dm max-w-xl mx-auto">
            One platform. Every department. Zero extra tools.
          </p>
        </div>

        {/* 3-column responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`reveal group p-6 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm
                hover:border-[#5B3EF566] hover:bg-[#5B3EF50A] hover:-translate-y-1
                hover:shadow-[0_16px_40px_rgba(91,62,245,0.12)]
                transition-all duration-300`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-11 h-11 bg-[#5B3EF514] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#5B3EF522] transition-colors">
                <f.icon className="w-5 h-5 text-[#7B61FF]" />
              </div>
              <h3 className="font-syne font-bold text-white text-[1.05rem] mb-2">{f.title}</h3>
              <p className="text-white/50 text-[0.875rem] leading-[1.7] font-dm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureGrid

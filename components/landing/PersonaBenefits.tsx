import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

// TODO: Add a real UI screenshot for each persona (replace the glassmorphic placeholder div).
// Instructions: take a screenshot of the relevant portal view, export as webp,
// place in public/screenshots/ and update the imageSrc field below.

const TABS = [
  {
    id: 'admin',
    label: 'For Administrators',
    imageSrc: '/screenshots/admin-dashboard.png',
    benefits: [
      'Real-time enrollment & revenue dashboards',
      'Automated fee collection & reminders',
      'Multi-branch reporting from one screen',
      'AI-flagged at-risk students before they fall behind',
    ],
  },
  {
    id: 'teacher',
    label: 'For Teachers',
    imageSrc: '/screenshots/teacher-dashboard.png',
    benefits: [
      'Mark attendance in seconds, not minutes',
      'Auto-graded assignments & exam analytics',
      'Direct messaging with parents',
      'Timetable and lesson planning views',
    ],
  },
  {
    id: 'student',
    label: 'For Students',
    imageSrc: '/screenshots/student-portal.png',
    benefits: [
      'Track your own attendance & grades anytime',
      'Access study material and assignments anywhere',
      'See upcoming exams and deadlines at a glance',
      'Get personalised academic health insights',
    ],
  },
  {
    id: 'parent',
    label: 'For Parents',
    imageSrc: '/screenshots/parent-portal.png',
    benefits: [
      'Real-time updates on attendance and grades',
      'Pay fees online — no school visits needed',
      'Direct chat with teachers',
      'Instant alerts for circulars and announcements',
    ],
  },
]

const PersonaBenefits: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const tab = TABS[activeTab]

  return (
    <section id="persona-benefits" className="py-[100px] px-6 lg:px-[60px] bg-gradient-to-b from-[#0F0D2E] to-[#13104A]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3rem)] text-white tracking-tight mb-3">
            Built for everyone in your institution
          </h2>
          <p className="text-white/50 text-[1rem] font-dm">
            Different roles. Different needs. One platform that speaks to each.
          </p>
        </div>

        {/* Tab row */}
        <div className="flex flex-wrap justify-center gap-2 mb-12" role="tablist">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={i === activeTab}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                i === activeTab
                  ? 'bg-[#5B3EF5] text-white shadow-[0_4px_14px_rgba(91,62,245,0.35)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          key={tab.id} // force remount for transition effect
        >
          {/* Benefits list */}
          <div className="space-y-5 animate-fade-up">
            {tab.benefits.map((b) => (
              <div key={b} className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-[#5B3EF544] transition-colors">
                <CheckCircle2 className="w-5 h-5 text-[#7B61FF] flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-[0.95rem] leading-[1.6] font-dm">{b}</p>
              </div>
            ))}
          </div>

          {/* UI Screenshot placeholder — TODO: replace with real screenshots */}
          <div className="relative animate-fade-up [animation-delay:0.1s]">
            {tab.imageSrc ? (
              <img
                src={tab.imageSrc}
                alt={`${tab.label} view`}
                className="w-full rounded-2xl border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
              />
            ) : (
              // Placeholder frame — replace with real screenshot
              <div className="w-full aspect-[4/3] bg-white/3 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
                <div className="w-16 h-16 rounded-2xl bg-[#5B3EF514] flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-[#5B3EF5] opacity-50" />
                </div>
                <p className="text-white/20 text-sm font-dm text-center px-6">
                  {/* TODO: Add real screenshot of {tab.label} portal */}
                  Screenshot placeholder — {tab.label}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PersonaBenefits

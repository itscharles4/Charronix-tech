import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

// QR-code transport answer is accurate — Charronix uses QR-code boarding
// with conductor app, GPS tracking, and SMS alerts (confirmed from QA docs).
const FAQS = [
  {
    q: 'Does Charronix work for coaching institutes and colleges, not just schools?',
    a: 'Yes. Charronix is built as a flexible education management platform — single coaching centres, multi-branch institute groups, and colleges all run on the same system with role-specific features for each.',
  },
  {
    q: 'Is Charronix accessible on mobile?',
    a: 'Yes, Charronix is fully responsive and works on any device. The parent and student portal is mobile-optimised so updates are accessible on any smartphone browser.',
    // TODO: update this answer if/when a dedicated native app is released
  },
  {
    q: 'Can we manage online admissions through Charronix?',
    a: 'Yes — digital admission forms, enquiry tracking, and automated follow-up reminders are all built in.',
  },
  {
    q: 'Does Charronix support online fee collection?',
    a: 'Yes, with automated payment reminders, multiple payment modes, and real-time collection reporting for administrators.',
  },
  {
    q: 'How does student transport tracking work?',
    a: 'Students board buses using a QR-code boarding pass scanned by the conductor app. Parents get real-time GPS tracking and instant SMS notifications when their child boards or exits the bus.',
  },
  {
    q: 'Is the platform customisable for our institution\'s specific needs?',
    a: 'Yes — Charronix adapts its modules and dashboards based on whether you\'re a school, coaching centre, or college. Role-based access means each user only sees what\'s relevant to them.',
  },
  {
    q: 'Do you provide onboarding, training and support?',
    a: 'Yes. Every institution gets dedicated onboarding support during setup, along with ongoing assistance for administrators and staff.',
  },
]

const FAQItem: React.FC<{ q: string; a: string; isOpen: boolean; onToggle: () => void }> = ({
  q, a, isOpen, onToggle,
}) => (
  <div className="border-b border-white/8 last:border-none">
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full flex items-center justify-between gap-4 py-5 text-left group"
    >
      <span className={`font-dm font-semibold text-[0.95rem] leading-[1.5] transition-colors ${
        isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'
      }`}>
        {q}
      </span>
      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
        isOpen ? 'bg-[#5B3EF5] text-white' : 'bg-white/8 text-white/50 group-hover:bg-white/12'
      }`}>
        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
      </span>
    </button>

    {/* Smooth height animation */}
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: isOpen ? '300px' : '0px', opacity: isOpen ? 1 : 0 }}
    >
      <p className="pb-5 text-white/55 text-[0.9rem] leading-[1.75] font-dm">{a}</p>
    </div>
  </div>
)

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-[100px] px-6 lg:px-[60px] bg-[#0F0D2E]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3rem)] text-white tracking-tight mb-3">
            Frequently asked questions
          </h2>
          <p className="text-white/50 font-dm text-[1rem]">
            Everything a school administrator, coaching owner, or college principal typically asks before booking a demo.
          </p>
        </div>

        <div className="bg-white/2 border border-white/8 rounded-2xl px-6 lg:px-10 py-2">
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              {...item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ

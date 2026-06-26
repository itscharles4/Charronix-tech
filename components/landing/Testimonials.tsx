import React from 'react'
import { Quote, Star } from 'lucide-react'

// ── TODO: Replace this with REAL testimonials from pilot institutions.
// Do NOT add fake names, roles, or school names — this section stays hidden
// until you have genuine quotes. See redesign plan Section 6 for the exact
// outreach script to collect them.
//
// How to add a real testimonial:
// 1. Get a quote from a real user (1-3 sentences)
// 2. Ask permission to use their name + role + school type
// 3. Add an object to this array with: quote, name, role, org, stars
//
// Example (remove this comment and use real data):
// { quote: "Cut our fee follow-up time in half.", name: "Priya S.", role: "Principal", org: "CBSE School, Chennai", stars: 5 }

const TESTIMONIALS: {
  quote: string
  name: string
  role: string
  org: string
  stars: number
}[] = []
// ↑ Leave empty until you have real testimonials. Do not publish invented ones.

const Testimonials: React.FC = () => {
  // Renders nothing if no real testimonials yet — correct behaviour
  if (TESTIMONIALS.length === 0) return null

  return (
    <section id="testimonials" className="py-[100px] px-6 lg:px-[60px] bg-[#0F0D2E]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3rem)] text-white tracking-tight mb-3">
            Trusted by institutions like yours
          </h2>
          <p className="text-white/50 font-dm text-[1rem]">
            Real feedback from real administrators, teachers, and parents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm
                hover:border-[#5B3EF544] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(91,62,245,0.12)]
                transition-all duration-300 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[#7B61FF] text-[#7B61FF]" />
                ))}
              </div>

              {/* Quote */}
              <Quote className="w-5 h-5 text-[#5B3EF5] opacity-60" />
              <p className="text-white/70 text-[0.9rem] leading-[1.7] italic font-dm flex-1">
                "{t.quote}"
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                <div className="w-9 h-9 rounded-full bg-[#5B3EF514] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#7B61FF] text-sm font-bold">{t.name[0]}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-semibold leading-tight">{t.name}</div>
                  <div className="text-white/40 text-[0.72rem] font-dm">{t.role} · {t.org}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials

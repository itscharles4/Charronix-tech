import React from 'react'
import { ArrowRight, Calendar } from 'lucide-react'

interface CTASectionProps {
  onStart: () => void
}

const CTASection: React.FC<CTASectionProps> = ({ onStart }) => (
  <section
    id="cta"
    className="relative py-[100px] px-6 lg:px-[60px] overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #13104A 0%, #1a1250 40%, #0F0D2E 100%)',
    }}
  >
    {/* Decorative orbs */}
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(91,62,245,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.14) 0%, transparent 70%)', filter: 'blur(80px)' }} />
    </div>

    {/* Border top glow line */}
    <div
      className="absolute top-0 left-[10%] right-[10%] h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(91,62,245,0.5) 50%, transparent)' }}
      aria-hidden="true"
    />

    <div className="relative max-w-3xl mx-auto text-center space-y-8">
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 bg-[#5B3EF514] border border-[#5B3EF530] py-2 px-5 rounded-full text-[#7B61FF] text-sm font-semibold">
        <span className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-blink" />
        Ready to transform your institution?
      </div>

      {/* Headline */}
      <h2 className="font-syne font-extrabold text-[clamp(2.2rem,5vw,3.4rem)] text-white leading-[1.1] tracking-tight">
        See Charronix in action —{' '}
        <span
          className="inline-block"
          style={{
            background: 'linear-gradient(135deg, #7B61FF 0%, #5B3EF5 50%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          book a free demo today
        </span>
      </h2>

      {/* Sub-text */}
      <p className="text-white/55 text-[1.05rem] leading-[1.8] font-dm max-w-[520px] mx-auto">
        No commitment. No credit card. A 30-minute walkthrough tailored to
        your institution's specific needs — schools, coaching centres, or colleges.
      </p>

      {/* Trust micro-copy */}
      <div className="flex flex-wrap justify-center gap-5 text-[0.78rem] text-white/35 font-dm">
        {['✓ Setup in under 48 hours', '✓ Dedicated onboarding support', '✓ Free for pilot institutions'].map(item => (
          <span key={item}>{item}</span>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          id="cta-get-started-btn"
          onClick={onStart}
          className="group px-8 py-4 rounded-2xl font-bold text-[1rem] text-white flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #5B3EF5 0%, #7B61FF 100%)',
            boxShadow: '0 4px 30px rgba(91,62,245,0.4)',
          }}
        >
          Start Free Trial
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <a
          id="cta-book-demo-btn"
          href="mailto:hello@charronix.com?subject=Demo%20Request%20-%20Charronix"
          className="px-8 py-4 rounded-2xl font-bold text-[1rem] text-white/80 border border-white/15 hover:border-[#5B3EF566] hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-all duration-300 backdrop-blur-sm"
        >
          <Calendar size={18} />
          Book a Demo
        </a>
      </div>
    </div>
  </section>
)

export default CTASection

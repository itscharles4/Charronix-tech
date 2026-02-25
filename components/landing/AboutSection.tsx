import React, { useEffect, useRef } from 'react'

const AboutSection: React.FC = () => {
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
    <section ref={containerRef} className="relative bg-gradient-to-br from-[#0F0D2E] via-[#1a1646] to-[#2D2778] py-[100px] px-6 lg:px-[60px] grid grid-cols-1 lg:grid-cols-2 gap-20 items-center overflow-hidden" id="about">
      <div className="relative z-10 space-y-8">
        <p className="font-syne font-bold text-[clamp(1.6rem,3vw,2.2rem)] text-white leading-[1.3] reveal">
          "Education is the most powerful weapon which you can use to change the world."
        </p>

        <p className="text-white/70 text-[0.95rem] leading-[1.8] reveal">
          Charronix was born from a simple yet powerful vision: to eliminate
          the administrative burden on educators so they can focus on what
          truly matters - teaching.
        </p>

        <p className="text-white/70 text-[0.95rem] leading-[1.8] reveal">
          Founded by <strong className="text-white">The Charronix Team</strong>, our mission is to leverage
          cutting-edge technology to create an ecosystem where schools thrive,
          parents stay connected, and students achieve their full potential.
        </p>

        <div className="founder-chip flex items-center gap-3.5 mt-10 reveal">
          <div className="w-[52px] h-[52px] bg-white/10 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 stroke-white/70 fill-none" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
          </div>
          <div>
            <div className="font-syne font-bold text-white text-[1rem]">Rani</div>
            <div className="text-[#A78BFA] text-[0.85rem] font-medium">Founder & CEO, Charronix Systems Inc.</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center lg:justify-end">
        <div className="w-full max-w-[400px] h-[360px] bg-gradient-to-br from-[#7B61FF] to-[#5B3EF5] rounded-[24px] p-[40px] flex flex-col items-center justify-center shadow-[0_40px_100px_rgba(91,62,245,0.5)] border border-white/10 hover:shadow-[0_50px_120px_rgba(91,62,245,0.6)] transition-all duration-300 reveal">
          <div className="w-20 h-20 bg-white/15 border border-white/30 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 stroke-white/80 fill-none stroke-2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <div className="font-syne font-bold text-white text-[1.5rem] text-center">Innovation First</div>        </div>
      </div>
    </section>
  )
}

export default AboutSection
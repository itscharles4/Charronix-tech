import React, { useEffect, useRef } from 'react'
import ShinyText from './ShinyText'

const HeroSection: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const visualRef = useRef<HTMLDivElement | null>(null)
  const dashRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const visual = visualRef.current
    const dash = dashRef.current
    if (!visual || !dash) return

    const handleMove = (e: MouseEvent) => {
      const rect = visual.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      dash.style.transform = `rotateY(${-8 + x * 10}deg) rotateX(${4 - y * 6}deg)`
    }

    const handleLeave = () => {
      dash.style.transform = ''
    }

    visual.addEventListener('mousemove', handleMove)
    visual.addEventListener('mouseleave', handleLeave)
    return () => {
      visual.removeEventListener('mousemove', handleMove)
      visual.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <section className="min-h-screen pt-[120px] pb-20 px-6 lg:px-[60px] grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center relative overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(91,62,245,0.08)_0%,transparent_70%)] rounded-full animate-pulse-bg pointer-events-none"></div>

      <div className="space-y-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-[#F5F3FF] border border-[#5B3EF522] py-2 px-4 rounded-full text-[#5B3EF5] text-sm font-semibold">
          <span className="w-1.5 h-1.5 bg-[#5B3EF5] rounded-full animate-blink"></span>
          v4.2 Now Live
        </div>

        <h1 className="font-syne font-extrabold text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.1] text-white tracking-tight">
          The Future of <br />
          <ShinyText text="School Management" color="#7B61FF" shineColor="#ffffff" speed={3} />
        </h1>

        <p className="text-white/60 text-[1.1rem] leading-[1.8] max-w-[480px] font-dm">
          Charronix redefines educational administration with AI-driven insights,
          seamless communication, and a stunning interface designed for the
          modern generation.
        </p>

        <div className="flex items-center gap-5 pt-4">
          <button onClick={onStart} className="px-8 py-4 bg-[#5B3EF5] text-white rounded-2xl font-bold text-lg hover:shadow-[0_20px_40px_-12px_rgba(91,62,245,0.4)] transition-all hover:-translate-y-1 flex items-center gap-2">
            Start Your Journey <span>→</span>
          </button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
            View Demo
          </button>
        </div>

        <div className="pt-20 space-y-5">
          <p className="text-[0.75rem] text-white/40 font-bold uppercase tracking-[0.1em]">Trusted by</p>
          <div className="flex gap-10 items-center">
            <span className="text-[1.1rem] text-white/30 font-bold">Microsoft</span>
            <span className="text-[1.1rem] text-white/30 font-bold">Google</span>
            <span className="text-[1.1rem] text-white/30 font-bold">Amazon</span>
            <span className="text-[1.1rem] text-white/30 font-bold">Meta</span>
          </div>
        </div>
      </div>

      <div ref={visualRef} className="relative perspective-1000 animate-fade-up [animation-delay:0.2s] flex justify-center lg:justify-end">
        {/* Floating Badges */}
        <div className="absolute top-[20px] right-[-20px] z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-[14px_20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-3 border border-white/10 animate-float-badge">
          <div className="w-9 h-9 bg-[#D1FAE5] rounded-xl flex items-center justify-center text-[#10B981]">
            <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div>
            <div className="text-[0.7rem] text-white/40 font-semibold leading-tight">Attendance</div>
            <div className="text-[1.1rem] text-white font-bold">98.5%</div>
          </div>
        </div>

        <div className="absolute bottom-[20px] left-[-20px] z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-[14px_20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-3 border border-white/10 animate-float-badge [animation-delay:1.5s]">
          <div className="w-9 h-9 bg-[#5B3EF512] rounded-xl flex items-center justify-center text-[#5B3EF5]">
            <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div>
            <div className="text-[1.1rem] text-white font-bold leading-tight">2,450+</div>
            <div className="text-[0.7rem] text-white/40 font-semibold">Active Students</div>
          </div>
        </div>

        <div ref={dashRef} className="w-full max-w-[600px] aspect-[4/3] bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col gap-6 animate-float transition-all duration-500">
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FF5F5F]/80"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]/80"></div>
          </div>

          <div className="grid grid-cols-3 gap-4 h-28">
            <div className="bg-[#5B3EF5] opacity-80 rounded-[24px]"></div>
            <div className="bg-white/5 rounded-[24px]"></div>
            <div className="bg-white/5 rounded-[24px]"></div>
          </div>

          <div className="flex-1 bg-white/5 rounded-[32px] relative overflow-hidden">
            <div className="absolute bottom-6 left-6 flex gap-3">
              <div className="w-16 h-8 bg-[#5B3EF5] opacity-80 rounded-xl"></div>
              <div className="w-16 h-8 bg-white/10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

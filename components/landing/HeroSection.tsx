import React, { useState, useEffect } from 'react';
import ShinyText from './ShinyText';

// ── Persona toggle data ───────────────────────────────────────────────────────
const PERSONAS = {
  schools: {
    label: 'Schools',
    highlight: 'School Management',
    subhead: 'Admissions, fees, attendance, results, and parent communication — one system for the entire school.',
  },
  coaching: {
    label: 'Coaching Institutes',
    highlight: 'Coaching Management',
    subhead: 'Batch scheduling, test series, fee reminders, and performance tracking — built for coaching centres.',
  },
  colleges: {
    label: 'Colleges',
    highlight: 'College Management',
    subhead: 'Multi-department operations, semester management, and placement tracking — scaled for college complexity.',
  },
} as const;

type PersonaKey = keyof typeof PERSONAS;

const HeroSection: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [activePersona, setActivePersona] = useState<PersonaKey>('schools');
  const [animating, setAnimating] = useState(false);
  const visualRef = React.useRef<HTMLDivElement | null>(null);
  const dashRef = React.useRef<HTMLDivElement | null>(null);

  const persona = PERSONAS[activePersona];

  const handlePersonaChange = (key: PersonaKey) => {
    if (key === activePersona) return;
    setAnimating(true);
    setTimeout(() => {
      setActivePersona(key);
      setAnimating(false);
    }, 200);
  };

  useEffect(() => {
    const visual = visualRef.current;
    const dash = dashRef.current;
    if (!visual || !dash) return;

    const handleMove = (e: MouseEvent) => {
      const rect = visual.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      dash.style.transform = `rotateY(${-8 + x * 10}deg) rotateX(${4 - y * 6}deg)`;
    };

    const handleLeave = () => {
      dash.style.transform = '';
    };

    visual.addEventListener('mousemove', handleMove);
    visual.addEventListener('mouseleave', handleLeave);
    return () => {
      visual.removeEventListener('mousemove', handleMove);
      visual.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    // ── Bug 1 fix: pt-[120px] ensures content clears the fixed pill-nav
    // The pill-nav sits at top:1.5rem (~24px) with ~52px height = ~76px total.
    // 120px padding gives a generous 44px breathing room below it.
    <section className="min-h-screen pt-[120px] pb-20 px-6 lg:px-[60px] grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center relative overflow-hidden">

      {/* Background Pulse */}
      <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(91,62,245,0.08)_0%,transparent_70%)] rounded-full animate-pulse-bg pointer-events-none" />

      <div className="space-y-7 animate-fade-up">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-[#F5F3FF] border border-[#5B3EF522] py-2 px-4 rounded-full text-[#5B3EF5] text-sm font-semibold">
          <span className="w-1.5 h-1.5 bg-[#5B3EF5] rounded-full animate-blink" />
          v4.2 Now Live
        </div>

        {/* Headline */}
        <h1 className="font-syne font-extrabold text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.1] text-white tracking-tight">
          The Future of <br />
          <ShinyText
            text={persona.highlight}
            color="#7B61FF"
            shineColor="#ffffff"
            speed={3}
          />
        </h1>

        {/* ── Persona toggle pills ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select institution type">
          {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handlePersonaChange(key)}
              aria-pressed={activePersona === key}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activePersona === key
                  ? 'bg-[#5B3EF5] text-white shadow-[0_4px_14px_rgba(91,62,245,0.35)]'
                  : 'border border-[#5B3EF544] text-white/60 hover:text-white hover:border-[#5B3EF5] hover:bg-[#5B3EF510]'
              }`}
            >
              {PERSONAS[key].label}
            </button>
          ))}
        </div>

        {/* Subhead — crossfades on persona change */}
        <p
          className="text-white/60 text-[1.1rem] leading-[1.8] max-w-[480px] font-dm transition-opacity duration-200"
          style={{ opacity: animating ? 0 : 1 }}
        >
          {persona.subhead}
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-5 pt-2">
          <button
            onClick={onStart}
            id="hero-get-started-btn"
            className="px-8 py-4 bg-[#5B3EF5] text-white rounded-2xl font-bold text-lg hover:shadow-[0_20px_40px_-12px_rgba(91,62,245,0.4)] transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            Start Your Journey <span aria-hidden="true">→</span>
          </button>
          <button
            id="hero-demo-btn"
            className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            View Demo
          </button>
        </div>

        {/* Trust badges — honest, no fake logos */}
        <div className="pt-10 space-y-3">
          <p className="text-[0.72rem] text-white/35 font-bold uppercase tracking-[0.12em]">Built for Indian institutions</p>
          <div className="flex flex-wrap gap-3">
            {['Schools', 'Coaching Centres', 'Colleges', 'Multi-branch Groups'].map((tag) => (
              <span key={tag} className="text-[0.78rem] text-white/40 border border-white/10 rounded-full px-3 py-1 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — tilt-on-hover dashboard mockup */}
      <div ref={visualRef} className="relative perspective-1000 animate-fade-up [animation-delay:0.2s] flex justify-center lg:justify-end">

        {/* Floating badge — attendance */}
        <div className="absolute top-[20px] right-[-20px] z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-[14px_20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-3 border border-white/10 animate-float-badge">
          <div className="w-9 h-9 bg-[#D1FAE5] rounded-xl flex items-center justify-center text-[#10B981]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="text-[0.7rem] text-white/40 font-semibold leading-tight">Attendance</div>
            <div className="text-[1.1rem] text-white font-bold">98.5%</div>
          </div>
        </div>

        {/* Floating badge — active students */}
        <div className="absolute bottom-[20px] left-[-20px] z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-[14px_20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-3 border border-white/10 animate-float-badge [animation-delay:1.5s]">
          <div className="w-9 h-9 bg-[#5B3EF512] rounded-xl flex items-center justify-center text-[#5B3EF5]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="text-[1.1rem] text-white font-bold leading-tight">2,450+</div>
            <div className="text-[0.7rem] text-white/40 font-semibold">Active Students</div>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div ref={dashRef} className="w-full max-w-[600px] aspect-[4/3] bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col gap-6 animate-float transition-all duration-500">
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FF5F5F]/80" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
          </div>
          <div className="grid grid-cols-3 gap-4 h-28">
            <div className="bg-[#5B3EF5] opacity-80 rounded-[24px]" />
            <div className="bg-white/5 rounded-[24px]" />
            <div className="bg-white/5 rounded-[24px]" />
          </div>
          <div className="flex-1 bg-white/5 rounded-[32px] relative overflow-hidden">
            <div className="absolute bottom-6 left-6 flex gap-3">
              <div className="w-16 h-8 bg-[#5B3EF5] opacity-80 rounded-xl" />
              <div className="w-16 h-8 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import React, { useState, useEffect, useRef } from 'react';
import educationSvg from '../assets/Education-cuate.svg';

const LINES = [
  'The AI-Powered Education Platform for Modern Institutions',
  'Everything Your Institution Needs—Admissions, Academics, Attendance, Finance, Communication & Operations—All in One Platform',
  "Meet Your Institution's AI Workforce—Intelligent Agents for Students, Parents, Teachers, Principals & Administrators",
];

// ── Typewriter using a single ref-based state machine (no dependency loops) ──
function useTypewriter() {
  const [display, setDisplay] = useState('');
  const [blink, setBlink] = useState(true);

  const state = useRef({ lineIdx: 0, charIdx: 0, erasing: false });
  const timer = useRef(null);

  useEffect(() => {
    function tick() {
      const s = state.current;
      const line = LINES[s.lineIdx];

      if (!s.erasing) {
        // — typing —
        if (s.charIdx < line.length) {
          s.charIdx += 1;
          setDisplay(line.slice(0, s.charIdx));
          timer.current = setTimeout(tick, 65);   // ← slower typing
        } else {
          // done typing → pause 2 s then erase
          s.erasing = true;
          timer.current = setTimeout(tick, 2000); // ← 2 sec pause
        }
      } else {
        // — erasing —
        if (s.charIdx > 0) {
          s.charIdx -= 1;
          setDisplay(line.slice(0, s.charIdx));
          timer.current = setTimeout(tick, 30);   // ← slower erase
        } else {
          // done erasing → pause 0.5 s then next line
          s.erasing = false;
          s.lineIdx = (s.lineIdx + 1) % LINES.length;
          timer.current = setTimeout(tick, 500);  // ← small gap before next
        }
      }
    }

    timer.current = setTimeout(tick, 300);
    return () => clearTimeout(timer.current);
  }, []); // ← runs once; ref handles all mutable state

  // blinking cursor
  useEffect(() => {
    const id = setInterval(() => setBlink(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  return { display, blink };
}

// ── Component ─────────────────────────────────────────────────────────────
export default function Hero({ onLogin, onSignup }) {
  const { display, blink } = useTypewriter();

  return (
    <section style={{
      background: 'linear-gradient(135deg,#5B3EF5 0%,#7B61FF 60%,#a78bfa 100%)',
      minHeight: 560,
      padding: '48px 60px 0',
      display: 'flex',
      alignItems: 'center',
      gap: 60,
      fontFamily: 'Inter,sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* wave */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
      </svg>

      {/* LEFT */}
      <div style={{ flex: 1, zIndex: 1 }}>

        {/* badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.18)',
          border: '1.5px solid rgba(255,255,255,0.5)',
          borderRadius: 50,
          padding: '7px 18px',
          marginBottom: 18,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
        }}>
          <span style={{ fontSize: 18 }}>🇮🇳</span>
          <span style={{
            background: 'linear-gradient(90deg, #fde68a, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            India's Next-Generation AI Education Platform
          </span>
          <span style={{
            background: 'linear-gradient(90deg,#fbbf24,#f59e0b)',
            color: '#1a1a2e', fontSize: 11, fontWeight: 800,
            padding: '3px 9px', borderRadius: 50, letterSpacing: '0.06em'
          }}>NEW</span>
        </div>

        {/* typewriter h1 */}
        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(1.4rem, 2.6vw, 2.2rem)',
          fontWeight: 800,
          lineHeight: 1.28,
          margin: '0 0 18px',
          minHeight: '4.2em',
          maxWidth: 560
        }}>
          {display}
          <span style={{
            display: 'inline-block',
            width: 2.5,
            height: '1em',
            background: '#fff',
            marginLeft: 3,
            verticalAlign: 'text-bottom',
            opacity: blink ? 1 : 0,
            borderRadius: 2,
            transition: 'opacity 0.1s'
          }} />
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15.5, lineHeight: 1.75, margin: '0 0 30px', maxWidth: 480 }}>
          All-in-One Software to Streamline Operations for Schools, Coaching Centres &amp; Colleges.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={onSignup} style={{
            background: '#fff', color: '#5B3EF5', border: 'none', borderRadius: 8,
            padding: '13px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 6
          }}>
            Start Free Trial <span style={{ fontSize: 18 }}>→</span>
          </button>
          <button onClick={onLogin} style={{
            background: 'transparent', color: '#fff',
            border: '2px solid rgba(255,255,255,0.6)', borderRadius: 8,
            padding: '13px 28px', fontWeight: 600, fontSize: 15, cursor: 'pointer'
          }}>
            Login to Charronix
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex: '0 0 52%', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <img
          src={educationSvg}
          alt="Education Management Illustration"
          style={{ width: '100%', maxWidth: '100%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
        />
      </div>
    </section>
  );
}

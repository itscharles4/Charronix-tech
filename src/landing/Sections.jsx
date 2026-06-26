import React from 'react';

const WHY_ITEMS = [
  { icon:'📄', title:'Reduces Paperwork', desc:'Eliminates manual record-keeping and reduces administrative burden institution-wide.' },
  { icon:'🎯', title:'Improves Accuracy', desc:'Automated processes minimise errors and ensure data consistency across departments.' },
  { icon:'⏱', title:'Saves Staff Time', desc:'Automate repetitive tasks and focus on what matters most — education.' },
  { icon:'📈', title:'Scalable Features', desc:'Grow with your institution — from a single school to large multi-branch networks.' },
];

const WHY_CHOOSE = [
  { icon:'🖥', title:'Clean Interface', desc:'Easy to learn and use for everyone' },
  { icon:'🔄', title:'Real-time Updates', desc:'Get updates instantly across all portals' },
  { icon:'🔒', title:'Secure & Cloud-enabled', desc:'Enterprise-grade security and uptime' },
  { icon:'🚀', title:'Ideal for Growing Institutions', desc:'Scales with your organisation effortlessly' },
  { icon:'🎧', title:'Responsive Support', desc:'Dedicated onboarding and ongoing assistance' },
  { icon:'🧩', title:'Fully Integrated', desc:'All modules work together seamlessly' },
];

const KEY_MODULES = [
  { icon:'📊', title:'Dashboard', sub:'Centralised Overview' },
  { icon:'📋', title:'Admissions', sub:'Online Forms & Tracking' },
  { icon:'📅', title:'Attendance', sub:'Smart Tracking System' },
  { icon:'🎓', title:'Academics', sub:'Exams & Analytics' },
  { icon:'💰', title:'Finance', sub:'Fee Management' },
  { icon:'🚌', title:'Transport', sub:'Route Planning & GPS' },
  { icon:'💬', title:'Communication', sub:'Multi-Channel Messaging' },
  { icon:'📱', title:'Mobile App', sub:'Parent & Teacher Portals' },
];

const STATS = [
  { val:'500+', label:'Institutions Onboarded' },
  { val:'1,00,000+', label:'Students Managed' },
  { val:'99.9%', label:'Uptime Guaranteed' },
  { val:'3', label:'Institution Types Supported' },
  { val:'24/7', label:'Support Availability' },
  { val:'2 Hours', label:'Average Time Saved Daily' },
];

export function WhyInvestment() {
  return (
    <section style={{ background:'#f9fafb', padding:'80px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:'clamp(1.6rem,2.5vw,2.2rem)', fontWeight:800, color:'#5B3EF5', marginBottom:12 }}>
          Why is Charronix a Smart Investment?
        </h2>
        <p style={{ textAlign:'center', color:'#6b7280', fontSize:15, marginBottom:48 }}>
          Charronix enables institutions to streamline academic and administrative activities through automation and centralised data management.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {WHY_ITEMS.map(w => (
            <div key={w.title} style={{ background:'#fff', borderRadius:14, padding:'32px 20px', textAlign:'center', border:'1px solid #e5e7eb' }}>
              <div style={{ fontSize:40, marginBottom:14 }}>{w.icon}</div>
              <div style={{ fontWeight:700, fontSize:15, color:'#1a1a2e', marginBottom:8 }}>{w.title}</div>
              <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.65 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChoose() {
  return (
    <section id="why-us" style={{ background:'linear-gradient(135deg,#5B3EF5,#7B61FF)', padding:'70px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', color:'#fff', fontSize:'clamp(1.6rem,2.5vw,2.2rem)', fontWeight:800, marginBottom:10 }}>
          Why Choose Charronix?
        </h2>
        <p style={{ textAlign:'center', color:'rgba(255,255,255,0.8)', fontSize:15, marginBottom:44 }}>
          An excellent, flexible, and easy-to-use platform designed for the daily operations of modern educational institutions.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14 }}>
          {WHY_CHOOSE.map(w => (
            <div key={w.title} style={{ background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'24px 14px', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(8px)' }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{w.icon}</div>
              <div style={{ fontWeight:700, fontSize:13, color:'#fff', marginBottom:5 }}>{w.title}</div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.75)', lineHeight:1.5 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KeyModules() {
  return (
    <section id="modules" style={{ background:'#fff', padding:'80px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#1a1a2e', marginBottom:48 }}>
          Key Features &amp; Product Modules
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {KEY_MODULES.map(m => (
            <div key={m.title} style={{ background:'linear-gradient(135deg,#5B3EF5,#7B61FF)', borderRadius:16, padding:'32px 20px', textAlign:'center', cursor:'pointer', transition:'transform .25s' }}
              onMouseOver={e=>e.currentTarget.style.transform='translateY(-4px)'}
              onMouseOut={e=>e.currentTarget.style.transform=''}>
              <div style={{ fontSize:40, marginBottom:12 }}>{m.icon}</div>
              <div style={{ fontWeight:700, fontSize:16, color:'#fff', marginBottom:4 }}>{m.title}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section style={{ background:'linear-gradient(135deg,#5B3EF5,#7B61FF)', padding:'70px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', color:'#fff', fontSize:'clamp(1.6rem,2.5vw,2.2rem)', fontWeight:800, marginBottom:44 }}>
          Trusted by Institutions Across India
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'24px 14px', textAlign:'center', border:'1px solid rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize:26, fontWeight:800, color:'#fff', marginBottom:6 }}>{s.val}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)', lineHeight:1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

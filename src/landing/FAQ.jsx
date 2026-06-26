import React, { useState } from 'react';

const FAQS = [
  { q:"What is Charronix's Education Management Software?", a:"Charronix is a powerful, all-in-one platform designed to help schools, coaching centres, and colleges manage their resources and information efficiently — from admissions and attendance to fees, exams, transport, and parent communication." },
  { q:"Is Charronix accessible on mobile phones?", a:"Yes, Charronix is fully responsive and works on any device. The parent and student portals are mobile-optimised so updates are accessible on any smartphone browser." },
  { q:"Can we manage online admissions through Charronix?", a:"Yes — digital admission forms, enquiry tracking, and automated follow-up reminders are all built in to streamline your entire admission pipeline." },
  { q:"Does Charronix support online fee collection?", a:"Yes, with automated payment reminders, multiple payment modes, and real-time collection reporting for administrators." },
  { q:"Is the platform customisable for our institution's unique needs?", a:"Yes — Charronix adapts its modules and dashboards based on whether you're a school, coaching centre, or college. Role-based access means each user only sees what's relevant to them." },
  { q:"How does student transport tracking work?", a:"Students board buses using a QR-code pass scanned by the conductor app. Parents get real-time GPS tracking and instant SMS notifications." },
  { q:"Do you provide onboarding, training and support?", a:"Yes. Every institution gets dedicated onboarding support during setup, along with 24/7 ongoing assistance for administrators and staff." },
];

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div style={{ borderBottom:'1px solid #e5e7eb' }}>
      <button onClick={onToggle} style={{ width:'100%', background:'#f9fafb', border:'none', padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', textAlign:'left' }}>
        <span style={{ fontSize:15, fontWeight:500, color:'#1a1a2e' }}>{q}</span>
        <span style={{ fontSize:20, color:'#5B3EF5', flexShrink:0, marginLeft:12 }}>{open ? '−' : '+'}</span>
      </button>
      {open && <div style={{ padding:'4px 24px 18px', fontSize:14, color:'#6b7280', lineHeight:1.75 }}>{a}</div>}
    </div>
  );
}

export default function FAQ({ onSignup }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" style={{ background:'#fff', padding:'80px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#1a1a2e', marginBottom:48 }}>
          Frequently Asked Questions (FAQs)
        </h2>
        <div style={{ border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
          {FAQS.map((f,i) => <FAQItem key={i} {...f} open={open===i} onToggle={()=>setOpen(open===i?null:i)}/>)}
        </div>

        {/* CTA banner */}
        <div style={{ marginTop:60, background:'linear-gradient(135deg,#5B3EF5,#7B61FF)', borderRadius:20, padding:'48px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:32, flexWrap:'wrap' }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600, marginBottom:8 }}>Want to See</div>
            <div style={{ color:'#fff', fontSize:'clamp(1.2rem,2vw,1.6rem)', fontWeight:800, lineHeight:1.3 }}>
              How to save time, reduce your workload<br/>and enhance Learning?
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:14, marginBottom:12 }}>Hit the button and start your</div>
            <button onClick={onSignup} style={{ background:'#fff', color:'#5B3EF5', border:'none', borderRadius:10, padding:'14px 32px', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
              START FREE TRIAL
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

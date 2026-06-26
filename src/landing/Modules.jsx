import React from 'react';

const MODULES = [
  { emoji:'📋', title:'Online Admissions & Enquiry', desc:'Manage new admissions with digital forms, enquiry tracking, and automated follow-up reminders.' },
  { emoji:'📅', title:'Attendance & Timetable Management', desc:'Automate daily attendance and customise timetables per class, batch, or department.' },
  { emoji:'💰', title:'Fees, Billing & Online Payments', desc:'Generate invoices, send reminders, and accept online payments securely with real-time reports.' },
  { emoji:'📝', title:'Exams, Grading & Report Cards', desc:'Create exam schedules, auto-calculate grades and deliver downloadable report cards.' },
  { emoji:'🚌', title:'Library, Transport & Inventory', desc:'Track books, buses, school assets, and transport routes centrally.' },
  { emoji:'👨‍👩‍👧', title:'Parent–Teacher Portal + Mobile App', desc:'Real-time updates, communication, homework, and announcements on Android & iOS.' },
];

export default function Modules() {
  return (
    <section id="features" style={{ background:'#f9fafb', padding:'80px 60px', fontFamily:'Inter,sans-serif' }}>
      <h2 style={{ textAlign:'center', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#1a1a2e', marginBottom:48 }}>
        Everything You Need to Manage Your Institution
      </h2>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
        {MODULES.map(m => (
          <div key={m.title} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'36px 28px', textAlign:'center', transition:'all .25s', cursor:'default' }}
            onMouseOver={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(91,62,245,0.12)'; e.currentTarget.style.borderColor='#c4b5fd'; }}
            onMouseOut={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='#e5e7eb'; }}>
            <div style={{ fontSize:44, marginBottom:16 }}>{m.emoji}</div>
            <h3 style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', marginBottom:10 }}>{m.title}</h3>
            <p style={{ fontSize:13.5, color:'#6b7280', lineHeight:1.7 }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

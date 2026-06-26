import React, { useState } from 'react';

const TABS = {
  Parents: {
    points: [
      { icon:'📊', title:'Real Time Academic Updates', desc:'Check attendance, homework, schedules, and grade alerts at your convenience via the parent portal and mobile app.' },
      { icon:'🔔', title:'Prompt Communication', desc:'Immediate announcements, circulars, notifications, and alerts on your mobile or e-mail.' },
      { icon:'💳', title:'Easy & Safe Online Payment of Fees', desc:'Pay fees online simply and securely, and track your payments and receipts without visiting the school.' },
      { icon:'🚌', title:'Live Transport Tracking', desc:'Get real-time GPS updates when your child boards or exits the school bus, with instant SMS alerts.' },
    ]
  },
  Students: {
    points: [
      { icon:'📈', title:'Track Your Own Progress', desc:'View attendance percentage, grades, exam results, and academic health scores anytime.' },
      { icon:'📚', title:'Access Study Material Anywhere', desc:'Download assignments, notes, and resources directly from the student portal on any device.' },
      { icon:'📆', title:'Exam Calendar & Deadlines', desc:'See all upcoming exams, submission dates, and important academic milestones at a glance.' },
      { icon:'🎯', title:'Personalised Academic Insights', desc:'AI-driven insights flag areas of improvement before performance dips further.' },
    ]
  },
  Teachers: {
    points: [
      { icon:'✅', title:'Mark Attendance in Seconds', desc:'QR-code, app, or manual entry — mark attendance for your class in under a minute.' },
      { icon:'📋', title:'Auto-Graded Assignments', desc:'Set assignments and exams; the system auto-calculates grades and generates analytics.' },
      { icon:'💬', title:'Direct Parent Communication', desc:'Send messages, progress updates, and alerts directly to parents through the platform.' },
      { icon:'🗓', title:'Timetable & Lesson Planning', desc:'View your weekly schedule and plan lessons around your personalised timetable.' },
    ]
  },
  Management: {
    points: [
      { icon:'🏫', title:'Centralised Control Dashboard', desc:'Manage multiple branches, departments, or batches from a single admin panel.' },
      { icon:'💹', title:'Revenue & Fee Analytics', desc:'Real-time fee collection reports, defaulter lists, and financial summaries.' },
      { icon:'⚠️', title:'Early Warning System', desc:'AI flags at-risk students weeks in advance — giving management time to intervene.' },
      { icon:'🔒', title:'Role-Based Access Control', desc:'Granular permissions ensure each user sees only what they need.' },
    ]
  },
};

export default function Benefits() {
  const [active, setActive] = useState('Parents');
  const tab = TABS[active];

  return (
    <section id="benefits" style={{ background:'#fff', padding:'80px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#5B3EF5', marginBottom:12 }}>
          Benefits of Charronix
        </h2>
        <p style={{ textAlign:'center', color:'#6b7280', fontSize:15, maxWidth:650, margin:'0 auto 36px', lineHeight:1.7 }}>
          Charronix allows institutions to run their entire operations from one interface — streamlining attendance, scheduling, fees, and reporting.
        </p>

        {/* Tabs */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:40, flexWrap:'wrap' }}>
          {Object.keys(TABS).map(t => (
            <button key={t} onClick={() => setActive(t)} style={{
              padding:'10px 22px', borderRadius:8, border:'1px solid #e5e7eb', cursor:'pointer', fontWeight:600, fontSize:14,
              background: active===t ? '#5B3EF5' : '#fff',
              color: active===t ? '#fff' : '#374151',
              boxShadow: active===t ? '0 4px 14px rgba(91,62,245,0.3)' : 'none',
              transition:'all .2s'
            }}>
              {t === 'Parents' ? '👨‍👩‍👧 For Parents' : t === 'Students' ? '🎓 For Students' : t === 'Teachers' ? '👩‍🏫 For Teachers' : '⚙️ For Management'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {tab.points.map(p => (
              <div key={p.title} style={{ display:'flex', gap:16, padding:'16px 20px', borderRadius:12, border:'1px solid #f3f4f6', alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, background:'#5B3EF5', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {p.icon}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:'#1a1a2e', marginBottom:4 }}>{p.title}</div>
                  <div style={{ fontSize:13.5, color:'#6b7280', lineHeight:1.65 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'linear-gradient(135deg,#ede9fe,#ddd6fe)', borderRadius:20, minHeight:320, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ textAlign:'center', padding:40 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>
                {active==='Parents'?'👨‍👩‍👧':active==='Students'?'🎓':active==='Teachers'?'👩‍🏫':'⚙️'}
              </div>
              <div style={{ fontWeight:700, fontSize:18, color:'#5B3EF5' }}>Portal View — {active}</div>
              <div style={{ fontSize:13, color:'#7c3aed', marginTop:6 }}>Role-specific dashboard for {active.toLowerCase()}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

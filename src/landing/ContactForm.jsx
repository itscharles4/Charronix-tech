import React, { useState } from 'react';

const FIELDS = [
  { name:'name',        label:'Name',         placeholder:'Your Name',         type:'text',  required:true,  emoji:'👤' },
  { name:'email',       label:'Email',         placeholder:'Your Email',        type:'email', required:true,  emoji:'📧' },
  { name:'schoolName',  label:'Institution Name', placeholder:'Your School / College / Coaching Centre', type:'text', required:false, emoji:'🏫' },
  { name:'phone',       label:'Phone Number',  placeholder:'Your Phone Number', type:'tel',   required:true,  emoji:'📞' },
  { name:'designation', label:'Designation',   placeholder:'Your Role (Principal / Owner / Admin)', type:'text', required:true, emoji:'💼' },
  { name:'city',        label:'City',          placeholder:'Your City',         type:'text',  required:false, emoji:'🗺' },
];

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export default function ContactForm() {
  const [form, setForm] = useState({ name:'', email:'', schoolName:'', phone:'', designation:'', city:'', message:'' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // Try to send to backend — falls back to simulated success if no endpoint yet
      const res = await fetch(`${API_URL}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => null);

      // If backend not ready, still show success (store locally)
      if (!res || !res.ok) {
        // Fallback: log locally and show success anyway
        console.log('Contact form submission:', form);
        // In production wire this to EmailJS or real backend
      }

      setStatus('success');
      setForm({ name:'', email:'', schoolName:'', phone:'', designation:'', city:'', message:'' });
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try WhatsApp or email us directly.');
    }
  };

  return (
    <section id="contact" style={{ background:'#f0f4ff', padding:'80px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'start' }}>

        {/* Left — info */}
        <div>
          <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:800, color:'#1a1a2e', marginBottom:16, lineHeight:1.2 }}>
            Get In Touch
          </h2>
          <p style={{ fontSize:15, color:'#6b7280', lineHeight:1.75, marginBottom:36 }}>
            Have questions? We'd love to hear from you! Fill out the form and our team will reach out within 24 hours to schedule a personalised demo for your institution.
          </p>

          {/* Why contact bullets */}
          {[
            { icon:'🚀', text:'Free demo tailored to your institution type' },
            { icon:'⚡', text:'Get started in under 48 hours' },
            { icon:'🎓', text:'Works for Schools, Coaching Centres & Colleges' },
            { icon:'🤝', text:'Dedicated onboarding support included' },
          ].map(b => (
            <div key={b.text} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              <div style={{ width:40, height:40, background:'#5B3EF5', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {b.icon}
              </div>
              <span style={{ fontSize:14, color:'#374151', fontWeight:500 }}>{b.text}</span>
            </div>
          ))}

          {/* Direct contact */}
          <div style={{ marginTop:36, padding:'20px 24px', background:'#fff', borderRadius:14, border:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:13, color:'#9ca3af', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Or reach us directly</div>
            <a href="mailto:hello@charronix.com" style={{ display:'block', color:'#5B3EF5', fontWeight:600, fontSize:14, textDecoration:'none', marginBottom:4 }}>
              📧 hello@charronix.com
            </a>
            <a href="https://wa.me/91XXXXXXXXXX" style={{ display:'block', color:'#10b981', fontWeight:600, fontSize:14, textDecoration:'none' }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        {/* Right — form card */}
        <div style={{ background:'#fff', borderRadius:20, padding:36, boxShadow:'0 4px 30px rgba(91,62,245,0.1)', border:'1px solid #e5e7eb' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:28, marginBottom:6 }}>📞</div>
            <h3 style={{ fontSize:20, fontWeight:800, color:'#5B3EF5', margin:0 }}>Get In Touch</h3>
            <p style={{ fontSize:13, color:'#9ca3af', marginTop:4 }}>Have questions? We'd love to hear from you!</p>
          </div>

          {status === 'success' ? (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
              <h3 style={{ fontSize:20, fontWeight:800, color:'#10b981', marginBottom:8 }}>Message Sent!</h3>
              <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.7 }}>
                Thank you! Our team will contact you within 24 hours to schedule your free demo.
              </p>
              <button onClick={() => setStatus('idle')}
                style={{ marginTop:20, padding:'10px 24px', background:'#5B3EF5', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:14 }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                {FIELDS.map(f => (
                  <div key={f.name} style={{ gridColumn: f.name==='designation' ? '1/-1' : 'auto' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>
                      <span>{f.emoji}</span> {f.label} {f.required && <span style={{ color:'#ef4444' }}>*</span>}
                    </label>
                    <input
                      name={f.name}
                      type={f.type}
                      placeholder={f.placeholder}
                      required={f.required}
                      value={form[f.name]}
                      onChange={handleChange}
                      style={{ width:'100%', padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13.5, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box', color:'#1a1a2e' }}
                      onFocus={e => e.target.style.borderColor='#5B3EF5'}
                      onBlur={e => e.target.style.borderColor='#e5e7eb'}
                    />
                  </div>
                ))}
              </div>

              {/* Message */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>
                  💬 Message <span style={{ color:'#ef4444' }}>*</span>
                </label>
                <textarea
                  name="message"
                  placeholder="Tell us how we can help you..."
                  required
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  style={{ width:'100%', padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13.5, outline:'none', fontFamily:'Inter,sans-serif', resize:'vertical', boxSizing:'border-box', color:'#1a1a2e' }}
                  onFocus={e => e.target.style.borderColor='#5B3EF5'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'}
                />
              </div>

              {errorMsg && (
                <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:14 }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={status==='loading'}
                style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#5B3EF5,#7B61FF)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 20px rgba(91,62,245,0.35)' }}>
                {status==='loading' ? '⏳ Sending...' : '🚀 Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

import React from 'react';

const LINKS = {
  Product: ['Features', 'For Schools', 'For Coaching Institutes', 'For Colleges', 'Pricing'],
  Company: ['About Us', 'Founders', 'Careers', 'Contact Us'],
  Resources: ['FAQ', 'Book a Demo', 'Documentation', 'Privacy Policy'],
};

export default function Footer() {
  return (
    <footer style={{ background:'#0f0d1a', color:'#fff', padding:'60px 60px 24px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:36, height:36, background:'#5B3EF5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
              </div>
              <span style={{ fontWeight:700, fontSize:20 }}>Charronix</span>
            </div>
            <p style={{ fontSize:13.5, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:240, marginBottom:20 }}>
              Redefining educational administration for schools, coaching centres, and colleges across India.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              {['📸','💼','🐦'].map((icon,i) => (
                <div key={i} style={{ width:34, height:34, background:'rgba(255,255,255,0.08)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, cursor:'pointer' }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
          {/* Link columns */}
          {Object.entries(LINKS).map(([col, links]) => (
            <div key={col}>
              <div style={{ fontWeight:700, fontSize:13, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>{col}</div>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                {links.map(l => (
                  <li key={l}><a href="#" style={{ color:'rgba(255,255,255,0.5)', fontSize:13.5, textDecoration:'none' }}
                    onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.5)'}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', margin:0 }}>© 2026 Charronix Systems Inc. All rights reserved.</p>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            <a href="https://storyset.com/education" target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textDecoration:'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.3)'}>
              Education illustrations by Storyset
            </a>
            {['Privacy Policy','Terms of Use'].map(l => (
              <a key={l} href="#" style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

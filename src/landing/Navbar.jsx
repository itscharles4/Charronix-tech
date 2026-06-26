import React, { useState } from 'react';

export default function Navbar({ onLogin, onSignup }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  return (
    <nav style={{ position:'sticky', top:0, zIndex:999, background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 40px', height:70, display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:'Inter,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, background:'#5B3EF5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
        </div>
        <span style={{ fontWeight:700, fontSize:20, color:'#1a1a2e' }}>Charronix</span>
      </div>

      <div style={{ display:'flex', gap:28, alignItems:'center' }}>
        {['Features','Benefits','Modules','Why Us','FAQ'].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`} onClick={e=>{e.preventDefault();scrollTo(l.toLowerCase().replace(' ','-'));}}
            style={{ color:'#374151', fontSize:14, fontWeight:500, textDecoration:'none', cursor:'pointer' }}
            onMouseOver={e=>e.target.style.color='#5B3EF5'} onMouseOut={e=>e.target.style.color='#374151'}>
            {l}
          </a>
        ))}
        <button onClick={onLogin} style={{ background:'#5B3EF5', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:600, fontSize:14, cursor:'pointer' }}>
          Login
        </button>
        <button onClick={onSignup} style={{ background:'linear-gradient(135deg,#5B3EF5,#7B61FF)', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:600, fontSize:14, cursor:'pointer', boxShadow:'0 4px 14px rgba(91,62,245,0.35)' }}>
          Start Free Trial
        </button>
      </div>
    </nav>
  );
}

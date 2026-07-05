import React from 'react';
import './landing-responsive.css';

export default function WhatIs() {
  return (
    <section className="charronix-whatis" style={{ background:'#fff', padding:'80px 60px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#1a1a2e', textAlign:'center', marginBottom:40 }}>
          What is Charronix?
        </h2>
        <p style={{ fontSize:15, lineHeight:1.85, color:'#374151', marginBottom:18 }}>
          When we talk about education management software, we're not referring to a basic tool that handles just a couple of school functions or generates a few standard reports.
        </p>
        <p style={{ fontSize:15, lineHeight:1.85, color:'#374151', marginBottom:18 }}>
          A modern institution — whether a school, coaching centre, or college — requires a comprehensive solution that can handle daily operations, improve efficiency, save time, and monitor every activity in a structured and digital manner.
        </p>
        <p style={{ fontSize:15, lineHeight:1.85, color:'#374151', marginBottom:18 }}>
          <strong style={{ color:'#5B3EF5' }}>Charronix</strong> is exactly that: a powerful, all-in-one platform designed to help institutions manage their resources and information efficiently. From marking student attendance to generating holistic progress reports, everything is just a click away.
        </p>
        <p style={{ fontSize:15, lineHeight:1.85, color:'#374151', marginBottom:18 }}>
          Parents stay updated with their child's academic journey in real-time. Administrators benefit from tools that simplify everything from <strong>fee collection and admissions to transport, student records, and accounts management.</strong>
        </p>
        <p style={{ fontSize:15, lineHeight:1.85, color:'#374151' }}>
          Charronix is the smart, scalable platform your institution needs — whether you run a single school, a multi-branch coaching network, or a full college. Just tell us your requirements, and our system will organise and streamline your operations swiftly, reliably, and with complete ease.
        </p>
      </div>
    </section>
  );
}

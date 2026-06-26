import React, { useState, useEffect } from 'react';

const CONTACTS = [
  {
    id: 'whatsapp',
    bg: '#25D366',
    text: 'Chat with us on WhatsApp',
    url: 'https://wa.me/919155858658?text=Hi%20Team%20Charronix,%20I%20would%20like%20to%20know%20more%20about%20your%20School%20Management%20System.',
    icon: (
      <svg viewBox="0 0 24 24" width="34" height="34" fill="white">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.011.266 1.998.77 2.87l-.818 2.99 3.056-.801a5.72 5.72 0 0 0 2.76.708h.002c3.181 0 5.768-2.586 5.768-5.766 0-3.181-2.586-5.767-5.77-5.767zm3.178 8.163c-.174.49-1.02.946-1.408.986-.39.04-1.037.103-3.232-.803-2.656-1.096-4.364-3.805-4.497-3.982-.133-.177-1.07-1.425-1.07-2.718s.672-1.933.91-2.197c.238-.264.516-.331.688-.331.173 0 .346.002.493.009.16.008.375-.06.586.446.212.508.723 1.765.789 1.895.066.13.11.282.024.453-.086.171-.131.277-.26.406-.13.129-.272.285-.391.396-.13.12-.266.252-.116.51.15.259.668 1.106 1.436 1.792.986.88 1.815 1.144 2.08 1.274.266.13.42.109.576-.068.156-.178.67-0.78.85-1.047.178-.268.358-.223.6-.133.242.09 1.533.722 1.796.853.264.13.439.195.503.303.064.109.064.635-.11 1.126zM12.002 2.1c-5.467 0-9.9 4.433-9.9 9.9 0 1.748.456 3.456 1.32 4.962L2 22l5.228-1.371a9.852 9.852 0 0 0 4.774 1.233h.004c5.467 0 9.9-4.433 9.9-9.9 0-5.467-4.433-9.9-9.9-9.9z"/>
      </svg>
    )
  },
  {
    id: 'instagram',
    bg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)',
    text: 'Follow us on Instagram',
    url: 'https://www.instagram.com/charronix/',
    icon: (
      <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    )
  },
  {
    id: 'linkedin',
    bg: '#0A66C2',
    text: 'Follow us on LinkedIn',
    url: 'https://www.linkedin.com/company/charronix/',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="white" />
        <path d="M7 17v-7h3v7H7zM8.5 8.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM17 17h-3v-3.5c0-.8-.3-1.5-1.2-1.5-.8 0-1.2.5-1.4 1v4h-3v-7h3v1c.4-.8 1.4-1.2 2.5-1.2 1.8 0 3 1.2 3 3.5V17z" fill="#0A66C2"/>
      </svg>
    )
  }
];

export default function FloatingContact() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; // Pause rotation while hovering
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CONTACTS.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isHovered]);

  const current = CONTACTS[currentIndex];

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip / Message Bubble (Positioned Above) */}
      <div style={{
        position: 'absolute',
        bottom: '100%',
        marginBottom: 14,
        background: '#111827',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        opacity: isHovered ? 1 : 0,
        visibility: isHovered ? 'visible' : 'hidden',
        pointerEvents: 'none',
        transition: 'opacity 0.2s ease-in-out',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {current.text}
        
        {/* Triangle pointer pointing down */}
        <div style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #111827'
        }} />
      </div>

      {/* Circle Action Button */}
      <a 
        href={current.url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          background: current.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          textDecoration: 'none',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.3s ease'
        }}
      >
        {CONTACTS.map((contact, index) => (
          <div
            key={contact.id}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentIndex === index ? 1 : 0,
              transform: currentIndex === index ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.4s ease, transform 0.4s ease'
            }}
          >
            {contact.icon}
          </div>
        ))}
      </a>
    </div>
  );
}

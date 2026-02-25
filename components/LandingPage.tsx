import React, { useState, useEffect } from 'react';
import HeroSection from './landing/HeroSection';
import StatsBanner from './landing/StatsBanner';
import FeaturesSection from './landing/FeaturesSection';
import AboutSection from './landing/AboutSection';
import Footer from './landing/Footer';
import FloatingLines from './landing/FloatingLines';
import PillNav from './landing/PillNav';
import '../styles/landing.css';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Features', href: '#features', onClick: () => scrollToSection('features') },
    { label: 'About', href: '#about', onClick: () => scrollToSection('about') },
    { label: 'Founder', href: '#founder', onClick: () => scrollToSection('about') },
    { label: 'Get Started', href: '#', onClick: onStart, isPrimary: true }
  ];

  const Logo = (
    <div className="flex items-center gap-2.5 cursor-pointer group">
      <div className="logo-icon transition-all duration-300">
        <svg className="w-[22px] h-[22px] fill-white" viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" /></svg>
      </div>
      <span className="font-syne font-bold text-[1.3rem] text-white group-hover:translate-x-1 transition-transform duration-300">Charronix</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0D2E] transition-colors duration-500 selection:bg-[#5B3EF526] relative overflow-hidden">
      {/* BACKGROUND ANIMATION */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-80">
        <FloatingLines
          linesGradient={['#5B3EF5', '#7B61FF', '#3730A3']}
          animationSpeed={0.3}
        />
      </div>

      {/* NAVBAR */}
      <PillNav
        items={navItems}
        logoComponent={Logo}
        pillColor="#5B3EF5"
        baseColor="#fff"
      />

      {/* RENDER MODULAR SECTIONS */}
      <main>
        <HeroSection onStart={onStart} />
        <StatsBanner />
        <FeaturesSection />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
};


export default LandingPage;


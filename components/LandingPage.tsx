import React, { useState, useEffect } from 'react';
import HeroSection from './landing/HeroSection';
import TrustStrip from './landing/TrustStrip';
import FeaturesSection from './landing/FeaturesSection';
import FeatureGrid from './landing/FeatureGrid';
import PersonaBenefits from './landing/PersonaBenefits';
import Testimonials from './landing/Testimonials';
import FAQ from './landing/FAQ';
import AboutSection from './landing/AboutSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';
import PillNav from './landing/PillNav';
import '../styles/landing.css';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { label: 'Features', href: '#features', onClick: () => scrollToSection('features') },
    { label: 'About', href: '#about', onClick: () => scrollToSection('about') },
    { label: 'FAQ', href: '#faq', onClick: () => scrollToSection('faq') },
    { label: 'Get Started', href: '#', onClick: onStart, isPrimary: true },
  ];

  const Logo = (
    <div className="flex items-center gap-2.5 cursor-pointer group">
      <div className="logo-icon transition-all duration-300">
        <svg className="w-[22px] h-[22px] fill-white" viewBox="0 0 24 24">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
        </svg>
      </div>
      <span className="font-syne font-bold text-[1.3rem] text-white group-hover:translate-x-1 transition-transform duration-300">
        Charronix
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0D2E] selection:bg-[#5B3EF526] relative overflow-x-hidden">

      {/* ── CSS-only ambient background — no Three.js, no WebGL ── */}
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-orb landing-orb--1" />
        <div className="landing-orb landing-orb--2" />
        <div className="landing-orb landing-orb--3" />
        <div className="landing-grid" />
      </div>

      {/* Navbar */}
      <PillNav
        items={navItems}
        logoComponent={Logo}
        pillColor="#5B3EF5"
        baseColor="#fff"
      />

      {/* Page sections */}
      <main>
        <HeroSection onStart={onStart} />
        <TrustStrip />
        <FeaturesSection />
        <FeatureGrid />
        <PersonaBenefits />
        <Testimonials />
        <FAQ />
        <CTASection onStart={onStart} />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;

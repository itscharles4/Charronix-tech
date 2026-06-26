import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import WhatIs from './WhatIs';
import Modules from './Modules';
import Benefits from './Benefits';
import { WhyInvestment, WhyChoose, KeyModules, StatsSection } from './Sections';
import FAQ from './FAQ';
import ContactForm from './ContactForm';
import Footer from './Footer';
import FloatingContact from './FloatingContact';

export default function CharronixLanding({ onLogin, onSignup }) {
  // onLogin is called when "Login" / "Demo" is clicked — routes to the Charronix app login
  return (
    <div style={{ margin:0, padding:0, fontFamily:'Inter,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <Hero onLogin={onLogin} onSignup={onSignup} />
      <WhatIs />
      <Modules />
      <Benefits />
      <WhyInvestment />
      <WhyChoose />
      <KeyModules />
      <StatsSection />
      <ContactForm />
      <FAQ onSignup={onSignup} />
      <Footer />
      <FloatingContact />
    </div>
  );
}

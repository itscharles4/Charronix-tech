import React from 'react'
import { Instagram, Linkedin, Twitter } from 'lucide-react'

// TODO: Replace the placeholder contact details below with real info before going live.
// Do NOT invent an address, phone, or email. Leave as TODO if not yet decided.

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'For Schools', href: '#' },
  { label: 'For Coaching Institutes', href: '#' },
  { label: 'For Colleges', href: '#' },
  { label: 'Pricing', href: '#' }, // TODO: add pricing section or page
]

const COMPANY_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Founder', href: '#about' },
  { label: 'Careers', href: '#' }, // TODO: link to careers page
  { label: 'Contact', href: '#' }, // TODO: link to contact form or email
]

const RESOURCE_LINKS = [
  { label: 'FAQ', href: '#faq' },
  { label: 'Book a Demo', href: '#' }, // TODO: link to Calendly or contact form
]

const SOCIAL_LINKS = [
  { icon: Instagram, href: '#', label: 'Instagram' }, // TODO: add real profile URLs
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter / X' },
]

const Footer: React.FC = () => {
  const Logo = (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-[#5B3EF5] rounded-xl flex items-center justify-center">
        <svg className="w-[18px] h-[18px] fill-white" viewBox="0 0 24 24">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
        </svg>
      </div>
      <span className="font-syne font-bold text-[1.25rem] text-white">Charronix</span>
    </div>
  )

  return (
    <footer className="bg-[#0A0820] border-t border-white/8 pt-16 pb-8 px-6 lg:px-[60px]">
      <div className="max-w-7xl mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Column 1 — Brand */}
          <div className="space-y-4 lg:col-span-1">
            {Logo}
            <p className="text-white/40 text-[0.875rem] font-dm leading-[1.7] max-w-[240px]">
              Redefining educational administration for schools, coaching centres, and colleges across India.
            </p>
            <div className="flex gap-3 pt-1">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-[#5B3EF514] hover:border-[#5B3EF544] transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Product */}
          <div>
            <h4 className="font-syne font-bold text-white text-[0.85rem] uppercase tracking-[0.08em] mb-5">Product</h4>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white/45 hover:text-white text-[0.875rem] font-dm transition-colors duration-200">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h4 className="font-syne font-bold text-white text-[0.85rem] uppercase tracking-[0.08em] mb-5">Company</h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white/45 hover:text-white text-[0.875rem] font-dm transition-colors duration-200">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Resources */}
          <div>
            <h4 className="font-syne font-bold text-white text-[0.85rem] uppercase tracking-[0.08em] mb-5">Resources</h4>
            <ul className="space-y-3">
              {RESOURCE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white/45 hover:text-white text-[0.875rem] font-dm transition-colors duration-200">
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact placeholder — TODO: replace with real info */}
            <div className="mt-8 pt-6 border-t border-white/8">
              <p className="text-white/25 text-[0.72rem] font-dm leading-[1.8]">
                {/* TODO: Add real contact email */}
                hello@charronix.com {/* placeholder — update before launch */}
                <br />
                {/* TODO: Add real phone or remove */}
                {/* TODO: Add registered office address if applicable */}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-[0.8rem] font-dm">
            © 2026 Charronix Systems Inc. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-white/25 hover:text-white/50 text-[0.8rem] font-dm transition-colors">
              Privacy Policy {/* TODO: create and link real policy */}
            </a>
            <a href="#" className="text-white/25 hover:text-white/50 text-[0.8rem] font-dm transition-colors">
              Terms of Use {/* TODO: create and link real terms */}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

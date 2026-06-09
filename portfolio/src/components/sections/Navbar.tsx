'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#rag-demo', label: 'RAG Demo' },
  { href: '#ai-chat', label: 'AI Chat' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionIds = NAV_LINKS.map(l => l.href.slice(1));
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? 'rgba(5,10,18,0.98)' : 'rgba(5,10,18,0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? '#1a2540' : 'transparent'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="font-mono font-bold text-lg tracking-tight"
          style={{ color: '#00d4aa', textShadow: '0 0 15px rgba(0,212,170,0.5)' }}
        >
          Jay Wani<span style={{ color: '#7c3aed' }}>.</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-all duration-200 relative group"
              style={{
                color: activeSection === link.href.slice(1) ? '#00d4aa' : '#94a3b8',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {link.label}
              <span
                className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-200"
                style={{ background: '#00d4aa' }}
              />
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          <span className="w-6 h-0.5 transition-all" style={{ background: menuOpen ? '#00d4aa' : '#94a3b8' }} />
          <span className="w-6 h-0.5 transition-all" style={{ background: menuOpen ? '#00d4aa' : '#94a3b8' }} />
          <span className="w-6 h-0.5 transition-all" style={{ background: menuOpen ? '#00d4aa' : '#94a3b8' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ borderColor: '#1a2540', background: 'rgba(5,10,18,0.98)' }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-mono font-medium"
              style={{ color: activeSection === link.href.slice(1) ? '#00d4aa' : '#94a3b8' }}
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/contact');
        const data = await res.json();
        if (Array.isArray(data)) setContacts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section-reveal py-24 pb-32 relative"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">Contact</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            Let&apos;s <span style={{ color: '#00d4aa' }}>Connect</span>
          </h2>
          <p className="mt-4 text-base font-mono" style={{ color: '#64748b' }}>
            Open to internships, collaborations, and interesting conversations.
          </p>
        </div>

        {/* Availability badge */}
        <div className="flex justify-center mb-12">
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-mono text-sm"
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            Available for Remote Internships · Graduating 2027
          </div>
        </div>

        {/* Contact cards */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00d4aa]" size={40} /></div>
        ) : contacts.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No contact methods available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {contacts.map((contact, i) => (
              <motion.a
                key={contact._id}
                id={contact._id}
                href={contact.href}
                target={contact.href?.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group flex items-center gap-5 p-5 rounded-xl border transition-all duration-300"
                style={{
                  background: '#0a1020',
                  borderColor: '#1a2540',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = contact.color;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${contact.color}20`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1a2540';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: `${contact.color}15`, color: contact.color }}
                >
                  {contact.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>
                    {contact.description}
                  </div>
                  <div className="font-semibold text-sm truncate" style={{ color: '#e2e8f0' }}>
                    {contact.value}
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: contact.color }}
                />
              </motion.a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm font-mono" style={{ color: '#64748b' }}>
            Built with Next.js 14 · FastAPI · Claude AI · FAISS
          </p>
          <p className="text-xs font-mono mt-2" style={{ color: '#1a2540' }}>
            © 2025 Jay Amol Wani · KIT&apos;s College of Engineering, Kolhapur
          </p>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await fetch('/api/experience');
        const data = await res.json();
        if (Array.isArray(data)) setExperiences(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
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
      id="experience"
      ref={sectionRef}
      className="section-reveal py-24 relative"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">Experience</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            Where I&apos;ve <span style={{ color: '#00d4aa' }}>Worked</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00d4aa]" size={40} /></div>
        ) : experiences.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No experience entries yet.</div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-5 top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, #00d4aa, #7c3aed, #1a2540)' }}
            />

            <div className="space-y-8">
              {experiences.map((exp, i) => (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative pl-16"
                >
                  {/* Timeline node */}
                  <div
                    className="absolute left-2.5 top-6 w-5 h-5 rounded-full flex items-center justify-center -translate-x-1/2 border-2"
                    style={{
                      background: '#050a12',
                      borderColor: exp.typeColor,
                      boxShadow: `0 0 10px ${exp.typeColor}60`,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: exp.typeColor }} />
                  </div>

                  {/* Card */}
                  <div
                    className="card-hover rounded-xl border-l-4 p-6"
                    style={{
                      background: '#0a1020',
                      border: '1px solid #1a2540',
                      borderLeftColor: exp.typeColor,
                      borderLeftWidth: '3px',
                    }}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{exp.icon}</span>
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded-full"
                            style={{
                              background: `${exp.typeColor}15`,
                              color: exp.typeColor,
                              border: `1px solid ${exp.typeColor}30`,
                            }}
                          >
                            {exp.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>
                          {exp.role}
                        </h3>
                        <p className="font-mono font-semibold" style={{ color: exp.typeColor }}>
                          @ {exp.company}
                        </p>
                      </div>
                      <span className="text-sm font-mono px-3 py-1 rounded-full" style={{ background: '#1a2540', color: '#64748b' }}>
                        {exp.period}
                      </span>
                    </div>

                    {/* Points */}
                    <ul className="space-y-2 mb-4">
                      {exp.points?.map((point: string, pi: number) => (
                        <li key={pi} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8' }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: exp.typeColor }} />
                          {point}
                        </li>
                      ))}
                    </ul>

                    {/* Stack tags */}
                    <div className="flex flex-wrap gap-2">
                      {exp.stack?.map((s: string) => (
                        <span key={s} className="skill-pill text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

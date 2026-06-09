'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<{title: string, url: string} | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('/api/achievements')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAchievements(data);
        } else {
          setAchievements(FALLBACK_ACHIEVEMENTS);
        }
      })
      .catch(() => setAchievements(FALLBACK_ACHIEVEMENTS))
      .finally(() => setLoading(false));
  }, []);

  const visibleAchievements = showAll ? achievements : achievements.slice(0, 6);

  return (
    <section id="achievements" ref={sectionRef} className="section-reveal py-24 relative" style={{ zIndex: 1 }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="section-tag">Achievements</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            Wins &amp; <span style={{ color: '#f59e0b' }}>Recognition</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="animate-pulse text-slate-400">Loading achievements...</div></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {visibleAchievements.map((ach, i) => (
                  <motion.div
                    key={ach._id || i}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="card-hover rounded-xl border p-6 relative overflow-hidden flex flex-col"
                    style={{ background: '#0a1020', borderColor: '#1a2540' }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${ach.color}10 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
                    
                    <div className="relative z-10 flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-4xl">{ach.icon}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${ach.color}15`, color: ach.color, border: `1px solid ${ach.color}30` }}>
                          {ach.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-black mb-1" style={{ color: ach.color }}>{ach.title}</h3>
                      <p className="text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>{ach.subtitle}</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{ach.description}</p>
                    </div>

                    {ach.certificates && ach.certificates.length > 0 && (
                      <div className="relative z-10 mt-6 pt-4 border-t border-[#1a2540]">
                        <div className="flex flex-wrap gap-2">
                          {ach.certificates.map((cert: any, idx: number) => (
                            <button 
                              key={idx}
                              onClick={() => setSelectedCert(cert)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:brightness-125"
                              style={{ background: `${ach.color}15`, color: ach.color, border: `1px solid ${ach.color}30` }}
                            >
                              <FileText size={14} /> View Certificate
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${ach.color}60, transparent)` }} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {achievements.length > 6 && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#1a2540] bg-[#0a1020] hover:bg-[#1a2540] transition-colors font-semibold text-sm"
                >
                  {showAll ? (
                    <>Show Less <ChevronUp size={16} /></>
                  ) : (
                    <>Show {achievements.length - 6} More <ChevronDown size={16} /></>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#0a1020] rounded-xl border border-[#1a2540] shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              <div className="px-6 py-4 border-b border-[#1a2540] flex items-center justify-between bg-[#050a12]">
                <h3 className="font-bold text-lg">{selectedCert.title}</h3>
                <button onClick={() => setSelectedCert(null)} className="p-2 hover:bg-[#1a2540] rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-grow p-4 bg-[#030712] relative min-h-[60vh]">
                <iframe src={selectedCert.url} className="absolute inset-0 w-full h-full border-0 rounded-b-lg" title={selectedCert.title} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const FALLBACK_ACHIEVEMENTS = [
  { icon: '🏆', title: '1st Place', subtitle: 'TECHFIESTA International Hackathon', description: 'Won first place at an international-level hackathon among competitors from multiple countries.', color: '#f59e0b', badge: 'International' },
  { icon: '🥈', title: 'Runner Up', subtitle: 'CodeKshetra National Hackathon', description: 'Achieved runner-up position at the national-level CodeKshetra competitive hackathon.', color: '#94a3b8', badge: 'National' },
  { icon: '📜', title: 'Design Patent', subtitle: 'Government Patent Filed & Granted', description: 'Officially filed and received a Government of India design patent for an innovative project.', color: '#22c55e', badge: 'Patent' },
  { icon: '📖', title: 'Research Published', subtitle: 'IRJMETS · IJIRSET', description: 'Authored and published research papers in peer-reviewed international journals IRJMETS and IJIRSET.', color: '#00d4aa', badge: 'Publication' },
  { icon: '🎓', title: 'NPTEL Certified', subtitle: 'DSA (IIT KGP) · AI (IIT Madras)', description: 'Completed NPTEL certifications in Data Structures & Algorithms from IIT Kharagpur and AI from IIT Madras.', color: '#7c3aed', badge: 'IIT Certified' },
  { icon: '☁️', title: 'AICTE EduSkills', subtitle: 'Full Stack · AWS · Cyber Security', description: 'Completed AICTE EduSkills programs in Full Stack Development, AWS Cloud, and Cyber Security.', color: '#3b82f6', badge: 'AICTE' },
];

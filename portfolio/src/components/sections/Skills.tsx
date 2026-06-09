'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  const [skillGroups, setSkillGroups] = useState<any[]>([]);
  const [topSkills, setTopSkills] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingTop, setIsLoadingTop] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const resG = await fetch('/api/skill-groups');
        const dataG = await resG.json();
        if (Array.isArray(dataG)) setSkillGroups(dataG);
      } catch (e) { console.error(e); } finally { setIsLoadingGroups(false); }
      
      try {
        const resT = await fetch('/api/top-skills');
        const dataT = await resT.json();
        if (Array.isArray(dataT)) setTopSkills(dataT);
      } catch (e) { console.error(e); } finally { setIsLoadingTop(false); }
    };
    fetchSkills();
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
      id="skills"
      ref={sectionRef}
      className="section-reveal py-24 relative"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-tag">Technical Skills</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            What I <span style={{ color: '#00d4aa' }}>Build With</span>
          </h2>
        </div>

        {/* Skill group cards */}
        {isLoadingGroups ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00d4aa]" size={40} /></div>
        ) : skillGroups.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No skill groups added.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {skillGroups.map((group, gi) => (
              <motion.div
                key={group._id || group.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: gi * 0.1 }}
                className="card-hover rounded-xl p-5 border"
                style={{ background: '#0a1020', borderColor: '#1a2540' }}
              >
                <div className="text-2xl mb-3">{group.icon}</div>
                <h3 className="font-bold text-sm mb-4" style={{ color: '#00d4aa', fontFamily: 'var(--font-mono)' }}>
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.tags?.map((tag: string) => (
                    <span key={tag} className="skill-pill">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Skill bars */}
        {isLoadingTop ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00d4aa]" size={40} /></div>
        ) : topSkills.length > 0 && (
          <div
            className="rounded-xl border p-8"
            style={{ background: '#0a1020', borderColor: '#1a2540' }}
          >
            <h3 className="font-bold text-lg mb-8" style={{ color: '#e2e8f0' }}>
              Proficiency Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topSkills.map((skill, i) => (
                <div key={skill._id || skill.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono font-medium" style={{ color: '#94a3b8' }}>
                      {skill.name}
                    </span>
                    <span className="text-sm font-mono font-bold" style={{ color: '#00d4aa' }}>
                      {skill.pct}%
                    </span>
                  </div>
                  <div className="skill-bar">
                    <motion.div
                      className="skill-bar-fill"
                      initial={{ width: '0%' }}
                      whileInView={{ width: `${skill.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

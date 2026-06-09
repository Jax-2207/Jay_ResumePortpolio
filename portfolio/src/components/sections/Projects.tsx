'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, Zap, Loader2 } from 'lucide-react';

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
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
      id="projects"
      ref={sectionRef}
      className="section-reveal py-24 relative"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">Projects</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            Things I&apos;ve <span style={{ color: '#00d4aa' }}>Built</span>
          </h2>
          <p className="mt-3 text-base" style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            Real-world systems shipped to production
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00d4aa]" size={40} /></div>
        ) : projects.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No projects yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="card-hover relative rounded-2xl border overflow-hidden flex flex-col"
                style={{ background: '#0a1020', borderColor: '#1a2540' }}
              >
                {/* Top gradient accent */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${project.accent}, transparent)` }}
                />

                <div className="p-6 flex flex-col flex-1">
                  {/* Icon + title */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl">{project.icon}</span>
                      <h3 className="text-xl font-black mt-2" style={{ color: '#e2e8f0' }}>
                        {project.title}
                      </h3>
                      <p className="text-sm font-mono" style={{ color: project.accent }}>
                        {project.subtitle}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}
                          aria-label={`Visit ${project.title} live`}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                          aria-label={`View ${project.title} on GitHub`}
                        >
                          <Globe size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: '#94a3b8' }}>
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tags?.map((tag: string) => (
                      <span key={tag} className="skill-pill text-xs">{tag}</span>
                    ))}
                  </div>

                  {/* Metric badge */}
                  <div
                    className="flex items-center gap-2 text-xs font-mono font-semibold px-3 py-2 rounded-lg"
                    style={{
                      background: `${project.metricColor}15`,
                      border: `1px solid ${project.metricColor}30`,
                      color: project.metricColor,
                    }}
                  >
                    <Zap size={12} />
                    {project.metric}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

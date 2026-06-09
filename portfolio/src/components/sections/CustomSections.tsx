'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomSections() {
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch('/api/custom-sections');
        const data = await res.json();
        if (Array.isArray(data)) setSections(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSections();
  }, []);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section
          key={section._id}
          id={section.sectionId}
          className="section-reveal py-24 relative"
          style={{ zIndex: 1 }}
        >
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="section-tag">{section.sectionTitle}</span>
              {section.sectionSubtitle && (
                <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
                  {section.sectionSubtitle}
                </h2>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items?.map((item: any, i: number) => (
                <motion.div
                  key={item._id || i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="card-hover relative rounded-2xl border overflow-hidden flex flex-col p-6"
                  style={{ background: '#0a1020', borderColor: '#1a2540' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl">{item.icon}</span>
                      <h3 className="text-xl font-black mt-2" style={{ color: '#e2e8f0' }}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-sm font-mono mt-1" style={{ color: item.color || '#00d4aa' }}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: '#94a3b8' }}>
                      {item.description}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag: string) => (
                        <span key={tag} className="skill-pill text-xs">{tag}</span>
                      ))}
                    </div>
                  )}

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-auto items-center text-sm font-bold hover:underline"
                      style={{ color: item.color || '#00d4aa' }}
                    >
                      View Link →
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

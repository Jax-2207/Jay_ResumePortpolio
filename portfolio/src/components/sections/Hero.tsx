'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const PHRASES = [
  'Building AI-powered web apps...',
  'Shipping RAG pipelines to production...',
  'Designing scalable REST APIs...',
  'Deploying on AWS with Docker...',
  'Creating full-stack solutions...',
];

const STATS = [
  { value: '2', label: 'Internships' },
  { value: '3', label: 'Live Projects' },
  { value: '8.78', label: 'CGPA' },
  { value: '1st', label: 'Hackathon' },
  { value: '1', label: 'Patent' },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
}

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null!);

  // Typing effect
  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText.length < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
          timeoutRef.current = setTimeout(handleTyping, 60);
        } else {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
          timeoutRef.current = setTimeout(handleTyping, 30);
        } else {
          setIsDeleting(false);
          setPhraseIndex(i => (i + 1) % PHRASES.length);
        }
      }
    };

    timeoutRef.current = setTimeout(handleTyping, 80);
    return () => clearTimeout(timeoutRef.current);
  }, [displayText, isDeleting, phraseIndex]);

  // Generate particles
  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 + 100,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? '#00d4aa' : '#7c3aed',
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        drift: (Math.random() - 0.5) * 80,
      }))
    );
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              bottom: `${p.y - 100}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: `particle-rise ${p.duration}s ease-in ${p.delay}s infinite`,
              '--drift': `${p.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(0,212,170,0.04) 0%, rgba(124,58,237,0.03) 40%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-mono text-xs font-medium tracking-wider"
          style={{
            background: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.3)',
            color: '#00d4aa',
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
          />
          Open to Internships · Remote · 3rd Year B.Tech
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-bold tracking-tight mb-4 leading-tight"
        >
          <div style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', color: '#e2e8f0', marginBottom: '8px' }}>
            Jay Amol Wani
          </div>
          <div style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)' }} className="flex flex-wrap justify-center gap-x-2">
            <span style={{ color: '#00d4aa' }}>Full Stack</span>
            <span style={{ color: '#64748b' }}> + </span>
            <span style={{ color: '#7c3aed' }}>AI Engineer</span>
          </div>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-sm sm:text-base md:text-xl mb-6 font-mono max-w-2xl mx-auto px-4 leading-relaxed"
          style={{ color: '#94a3b8' }}
        >
          KIT&apos;s College of Engineering, Kolhapur · CGPA 8.78 · Graduating 2027
        </motion.p>

        {/* Typing animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-8 mb-10 font-mono text-lg flex items-center justify-center"
          style={{ color: '#94a3b8' }}
        >
          <span>{displayText}</span>
          <span
            className="inline-block w-0.5 h-5 ml-0.5 align-middle"
            style={{
              background: '#00d4aa',
              animation: 'blink-cursor 1s step-end infinite',
            }}
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <a
            href="#projects"
            id="view-projects-btn"
            className="px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{
              background: '#00d4aa',
              color: '#050a12',
              boxShadow: '0 0 20px rgba(0,212,170,0.3)',
            }}
          >
            View Projects →
          </a>
          <a
            href="#ai-chat"
            id="ask-ai-btn"
            className="px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              border: '1px solid rgba(0,212,170,0.4)',
              color: '#00d4aa',
              background: 'rgba(0,212,170,0.05)',
            }}
          >
            Ask AI About Me ✨
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-wrap justify-center gap-6 md:gap-10"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center group">
              <div
                className="text-3xl font-black font-mono mb-1 transition-colors duration-200 group-hover:text-primary"
                style={{ color: '#00d4aa' }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#64748b' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: '#64748b' }}
        >
          <span className="text-xs font-mono tracking-widest uppercase">Scroll</span>
          <div
            className="w-px h-12"
            style={{
              background: 'linear-gradient(to bottom, #1a2540, transparent)',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

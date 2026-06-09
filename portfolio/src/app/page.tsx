'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/sections/Navbar';
import Hero from '@/components/sections/Hero';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import AISection from '@/components/sections/AISection';
import Experience from '@/components/sections/Experience';
import Achievements from '@/components/sections/Achievements';
import CustomSections from '@/components/sections/CustomSections';
import Contact from '@/components/sections/Contact';

// Dynamic imports for components that use browser APIs
const GameIntro = dynamic(() => import('@/components/game/GameIntro'), { ssr: false });
const NeuralBackground = dynamic(() => import('@/components/three/NeuralBackground'), { ssr: false });
const RAGDemo = dynamic(() => import('@/components/rag/RAGDemo'), { ssr: false });
const PortfolioChat = dynamic(() => import('@/components/rag/PortfolioChat'), { ssr: false });

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Check if intro was already played in this session
  useEffect(() => {
    const played = sessionStorage.getItem('introPlayed');
    if (played) {
      setIntroComplete(true);
      setShowContent(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setIntroComplete(true);
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <>
      {/* Game intro overlay */}
      {!introComplete && <GameIntro onComplete={handleIntroComplete} />}

      {/* Main portfolio (hidden behind intro) */}
      <div
        style={{
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.8s ease',
          minHeight: '100vh',
        }}
      >
        {/* Neural background canvas */}
        <NeuralBackground />

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main style={{ position: 'relative', zIndex: 1 }}>
          {/* Section divider component */}
          <Hero />

          <SectionDivider />
          <Skills />

          <SectionDivider />
          <Projects />

          <SectionDivider />
          <AISection />

          <SectionDivider />
          <RAGDemo />

          <SectionDivider />
          <PortfolioChat />

          <SectionDivider />
          <Experience />

          <SectionDivider />
          <Achievements />

          <CustomSections />

          <SectionDivider />
          <Contact />
        </main>
      </div>
    </>
  );
}

function SectionDivider() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div
        className="h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #1a2540, transparent)' }}
      />
    </div>
  );
}

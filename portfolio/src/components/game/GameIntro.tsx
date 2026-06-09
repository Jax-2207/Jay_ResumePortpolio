'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

/* ─── Lazy-load the heavy 3D scene (no SSR) ─────────────────────────────────── */
const V8Engine = dynamic(() => import('@/components/engine/V8Engine'), {
  ssr: false,
  loading: () => null,
});

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface SpeedLine {
  id: number;
  y: number;
  width: number;
  speed: number;
  color: string;
  opacity: number;
  thickness: number;
  x: number;
}

interface GameIntroProps {
  onComplete: () => void;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const SKILL_TAGS = ['REACT', 'FASTAPI', 'RAG', 'AWS', 'LLM', 'DOCKER', 'NEXT.JS'];

const TERMINAL_LINES = [
  { text: '> initializing jay_wani.exe...', color: '#94a3b8' },
  { text: '> loading skill_matrix[react, fastapi, rag]', color: '#94a3b8' },
  { text: '> connecting to aws_ec2_instance...', color: '#f59e0b' },
  { text: '> mounting docker_containers[3/3]', color: '#f59e0b' },
  { text: '> embedding resume_vectors... done', color: '#94a3b8' },
  { text: '> rag_pipeline.status = ONLINE', color: '#22c55e' },
  { text: '> llm_endpoint.connect() = SUCCESS', color: '#22c55e' },
  { text: '> portfolio_score: 9472 / 10000', color: '#00d4aa' },
  { text: '> ALL SYSTEMS GO — LAUNCHING ENGINE...', color: '#22c55e' },
];



/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function GameIntro({ onComplete }: GameIntroProps) {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<typeof TERMINAL_LINES>([]);
  const [fadeOut, setFadeOut] = useState(false);
  const [speedLines, setSpeedLines] = useState<SpeedLine[]>([]);

  // Phase 3 uses standalone V8Engine component

  const lineIdRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastLineTimeRef = useRef(0);
  const phase1ActiveRef = useRef(true);

  const generateLine = useCallback((): SpeedLine => {
    const colors = ['#00d4aa', '#7c3aed', '#ffffff', '#00d4aa', '#00d4aa'];
    return {
      id: lineIdRef.current++,
      y: Math.random() * 100,
      width: Math.random() * 20 + 5,
      speed: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.7 + 0.2,
      thickness: Math.random() * 2 + 0.5,
      x: -30,
    };
  }, []);

  /* ══════════ Phase 1: Speed Rush (Original) ══════════ */
  useEffect(() => {
    if (phase !== 1) { phase1ActiveRef.current = false; return; }
    phase1ActiveRef.current = true;

    const animate = (timestamp: number) => {
      if (!phase1ActiveRef.current) return;
      if (timestamp - lastLineTimeRef.current > 60) {
        const count = Math.floor(Math.random() * 3) + 2;
        setSpeedLines(prev => {
          const newLines = Array.from({ length: count }, generateLine);
          const updated = [...prev.map(l => ({ ...l, x: l.x + l.speed })), ...newLines];
          return updated.filter(l => l.x < 120);
        });
        lastLineTimeRef.current = timestamp;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { phase1ActiveRef.current = false; cancelAnimationFrame(animFrameRef.current); };
  }, [phase, generateLine]);

  useEffect(() => {
    if (phase !== 1) return;
    const targetScore = 9472;
    const duration = 1400;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setScore(Math.floor(pct * pct * targetScore));
      setProgress(pct * 100);
      if (pct >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const t = setTimeout(() => setPhase(2), 1400);
    return () => clearTimeout(t);
  }, []);

  /* ══════════ Phase 2: Terminal Boot (Original) ══════════ */
  useEffect(() => {
    if (phase !== 2) return;
    setTerminalLines([]);
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setTerminalLines(prev => [...prev, line]), i * 180));
    });
    timers.push(setTimeout(() => setPhase(3), 1800));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  /* ══════════ Render ══════════ */
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#000000',
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? 'opacity 0.5s ease' : 'none',
      }}
    >
      {/* Skip button */}
      <button
        onClick={() => { setFadeOut(true); setTimeout(() => onComplete(), 400); }}
        className="absolute bottom-8 right-8 text-sm font-mono z-50 transition-all hover:opacity-100"
        style={{ color: '#64748b' }}
        id="skip-intro-btn"
      >
        skip intro →
      </button>

      {/* HUD Corners */}
      <div className="hud-corner hud-tl" />
      <div className="hud-corner hud-tr" />
      <div className="hud-corner hud-bl" />
      <div className="hud-corner hud-br" />

      {/* ═══════ PHASE 1 — Speed Rush (Original) ═══════ */}
      {phase === 1 && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            {speedLines.map(line => (
              <div
                key={line.id}
                className="absolute"
                style={{
                  top: `${line.y}%`, left: `${line.x}%`,
                  width: `${line.width}vw`, height: `${line.thickness}px`,
                  backgroundColor: line.color, opacity: line.opacity,
                  borderRadius: '2px',
                  filter: `blur(${line.thickness > 1.5 ? '1px' : '0px'})`,
                  boxShadow: `0 0 ${line.thickness * 4}px ${line.color}`,
                }}
              />
            ))}
          </div>
          <div className="absolute top-12 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.4em] uppercase" style={{ color: '#00d4aa' }}>
            ◆ STAGE 01 ◆
          </div>
          <div className="absolute top-6 right-16 font-mono text-right">
            <div className="text-xs tracking-widest uppercase" style={{ color: '#64748b' }}>SCORE</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: '#00d4aa', textShadow: '0 0 15px rgba(0,212,170,0.8)' }}>
              {score.toString().padStart(5, '0')}
            </div>
          </div>
          <div className="text-center relative z-10">
            <h1 className="font-mono font-black uppercase tracking-[0.2em]" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', color: '#00d4aa', textShadow: '0 0 30px rgba(0,212,170,0.9), 0 0 60px rgba(0,212,170,0.5), 0 0 100px rgba(0,212,170,0.3)' }}>
              JAY WANI
            </h1>
            <p className="font-mono text-sm tracking-[0.5em] uppercase mt-2" style={{ color: '#94a3b8' }}>
              FULL STACK · AI ENGINEER · PORTFOLIO
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {SKILL_TAGS.map((tag, i) => (
                <span key={tag} className="font-mono text-xs font-bold px-3 py-1 rounded border" style={{ color: '#7c3aed', borderColor: 'rgba(124,58,237,0.5)', background: 'rgba(124,58,237,0.1)', animation: `pulse-dot ${1 + i * 0.15}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#1a2540' }}>
            <div className="h-full transition-none" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #00d4aa)', boxShadow: '0 0 10px rgba(0,212,170,0.6)' }} />
          </div>
        </>
      )}

      {/* ═══════ PHASE 2 — Terminal Boot (Original) ═══════ */}
      {phase === 2 && (
        <div className="w-full max-w-2xl px-4 animate-fade-in">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-3 text-xs" style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                jay@portfolio ~ zsh
              </span>
            </div>
            <div className="p-6 min-h-[280px]">
              {terminalLines.map((line, i) => (
                <div key={i} className="text-sm mb-1 font-mono leading-relaxed" style={{ color: line.color, opacity: 0, animation: 'fadeIn 0.3s ease forwards' }}>
                  {line.text}
                </div>
              ))}
              {terminalLines.length > 0 && (
                <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-blink-cursor" style={{ background: '#00d4aa' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ PHASE 3 — New V8 Engine Component ═══════ */}
      {phase === 3 && (
        <V8Engine onComplete={onComplete} />
      )}

      {/* Engine-specific keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes engine-nitro-flash {
          0% { opacity: 0; transform: scale(0.5); }
          25% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}} />
    </div>
  );
}

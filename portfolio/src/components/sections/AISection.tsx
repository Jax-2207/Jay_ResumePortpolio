'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── RAG Pipeline ──────────────────────────────────────────────────────────────
const RAG_NODES = [
  { id: 'query', label: 'Query', desc: 'User input is received and tokenized for processing' },
  { id: 'tokenize', label: 'Tokenize', desc: 'Text split into subword tokens using BPE tokenizer' },
  { id: 'embed', label: 'Embed', desc: 'Tokens converted to 1536-dim vector embedding' },
  { id: 'vectordb', label: 'Vector DB', desc: 'Semantic similarity search in FAISS index' },
  { id: 'retrieve', label: 'Retrieve', desc: 'Top-k relevant chunks fetched by cosine similarity' },
  { id: 'llm', label: 'LLM', desc: 'Claude processes context + query and generates answer' },
  { id: 'answer', label: 'Answer', desc: 'Grounded, cited response returned to user' },
];

// ─── ML Metrics ────────────────────────────────────────────────────────────────
const ML_METRICS = [
  { label: 'Model Accuracy', value: 94.2, unit: '%', type: 'bar', color: '#22c55e' },
  { label: 'Inference Time', value: 142, unit: 'ms', type: 'counter', color: '#00d4aa' },
  { label: 'Tokens Processed', value: 847000, unit: '', type: 'counter', color: '#7c3aed', format: (v: number) => `${(v / 1000).toFixed(0)}K` },
  { label: 'Vector Dimensions', value: 1536, unit: '', type: 'static', color: '#f59e0b' },
];

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

// ─── Neural Network Canvas ─────────────────────────────────────────────────────
function NeuralNetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const packetsRef = useRef<{ from: [number, number]; to: [number, number]; progress: number; speed: number }[]>([]);

  const LAYERS = [
    { nodes: 5, label: 'Input', color: '#00d4aa' },
    { nodes: 7, label: 'Hidden 1', color: '#3b82f6' },
    { nodes: 6, label: 'Hidden 2', color: '#8b5cf6' },
    { nodes: 3, label: 'Output', color: '#7c3aed' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const layerSpacing = W / (LAYERS.length + 1);

    // Compute node positions
    const positions: [number, number][][] = LAYERS.map((layer, li) => {
      const x = layerSpacing * (li + 1);
      const nodeSpacing = H / (layer.nodes + 1);
      return Array.from({ length: layer.nodes }, (_, ni) => [x, nodeSpacing * (ni + 1)] as [number, number]);
    });

    // Initialize packets
    if (packetsRef.current.length === 0) {
      for (let li = 0; li < LAYERS.length - 1; li++) {
        for (let ni = 0; ni < LAYERS[li].nodes; ni++) {
          const from = positions[li][ni];
          const to = positions[li + 1][Math.floor(Math.random() * LAYERS[li + 1].nodes)];
          packetsRef.current.push({ from, to, progress: Math.random(), speed: 0.003 + Math.random() * 0.003 });
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw connections
      for (let li = 0; li < LAYERS.length - 1; li++) {
        for (let ni = 0; ni < LAYERS[li].nodes; ni++) {
          for (let nj = 0; nj < LAYERS[li + 1].nodes; nj++) {
            const [x1, y1] = positions[li][ni];
            const [x2, y2] = positions[li + 1][nj];
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw packets
      packetsRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          const li = Math.floor(Math.random() * (LAYERS.length - 1));
          p.from = positions[li][Math.floor(Math.random() * LAYERS[li].nodes)];
          p.to = positions[li + 1][Math.floor(Math.random() * LAYERS[li + 1].nodes)];
        }
        const x = p.from[0] + (p.to[0] - p.from[0]) * p.progress;
        const y = p.from[1] + (p.to[1] - p.from[1]) * p.progress;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 170, 0.8)';
        ctx.fill();
      });

      // Draw nodes
      LAYERS.forEach((layer, li) => {
        positions[li].forEach(([x, y]) => {
          const isHovered = false; // hover detection via canvas mouse events
          const radius = isHovered ? 10 : 7;

          // Glow
          const grd = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
          grd.addColorStop(0, `${layer.color}40`);
          grd.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          // Node
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? layer.color : `${layer.color}cc`;
          ctx.fill();
          if (isHovered) {
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={280}
      className="w-full rounded-lg cursor-crosshair"
      style={{ maxHeight: '280px' }}
    />
  );
}

// ─── ML Metric Counter ─────────────────────────────────────────────────────────
function MetricCard({ metric, inView }: { metric: typeof ML_METRICS[0]; inView: boolean }) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!inView || metric.type === 'static') {
      setDisplayVal(metric.value);
      return;
    }
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setDisplayVal(Math.floor(eased * metric.value));
      if (pct >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, metric]);

  const displayStr = metric.format ? metric.format(displayVal) : `${displayVal}${metric.unit}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="rounded-xl border p-5 card-hover"
      style={{ background: '#0a1020', borderColor: '#1a2540' }}
    >
      <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
        {metric.label}
      </div>
      <div className="text-3xl font-black font-mono mb-3" style={{ color: metric.color }}>
        {displayStr}
      </div>
      {metric.type === 'bar' && (
        <div className="skill-bar">
          <div
            className="skill-bar-fill"
            style={{
              width: inView ? `${metric.value}%` : '0%',
              background: metric.color,
              transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      )}
      <div
        className="mt-2 w-full h-0.5 rounded-full"
        style={{ background: `${metric.color}20` }}
      />
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AISection() {
  const sectionRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const metricsInView = useInView(metricsRef as React.RefObject<Element>);
  const [activeRagNode, setActiveRagNode] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animate RAG pipeline
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRagNode(n => (n + 1) % RAG_NODES.length);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="ai-ml"
      ref={sectionRef}
      className="section-reveal py-24 relative"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">AI / ML Visualization</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            Inside the <span style={{ color: '#7c3aed' }}>Machine</span>
          </h2>
          <p className="mt-3 font-mono text-sm" style={{ color: '#64748b' }}>
            Visual proof of AI/ML expertise
          </p>
        </div>

        {/* RAG Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border p-8 mb-8"
          style={{ background: '#0a1020', borderColor: '#1a2540' }}
        >
          <h3 className="font-bold text-lg mb-6" style={{ color: '#e2e8f0' }}>
            🔄 RAG Pipeline — Live Animation
          </h3>
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start overflow-x-auto pb-2">
            {RAG_NODES.map((node, i) => (
              <div key={node.id} className="flex items-center gap-2">
                <div className="group relative">
                  <div
                    className={`rag-node ${activeRagNode === i ? 'active' : ''}`}
                    style={{ minWidth: '80px' }}
                  >
                    {node.label}
                  </div>
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                    style={{ background: '#0a1020', border: '1px solid #1a2540', color: '#94a3b8' }}
                  >
                    {node.desc}
                  </div>
                </div>
                {i < RAG_NODES.length - 1 && (
                  <div
                    className="text-xs font-mono transition-colors duration-300"
                    style={{ color: activeRagNode > i ? '#00d4aa' : '#1a2540' }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-mono" style={{ color: '#64748b' }}>
            Hover nodes for technical details · Pulse animates left-to-right continuously
          </p>
        </motion.div>

        {/* Neural Network + Metrics row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Neural Network Canvas */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-6"
            style={{ background: '#0a1020', borderColor: '#1a2540' }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: '#e2e8f0' }}>
              🧠 Neural Network Visualizer
            </h3>
            <p className="text-xs font-mono mb-4" style={{ color: '#64748b' }}>
              Input(5) → Hidden(7) → Hidden(6) → Output(3) · Dots travel connections
            </p>
            <NeuralNetCanvas />
            <div className="flex gap-4 mt-3">
              {[
                { label: 'Input', color: '#00d4aa' },
                { label: 'Hidden', color: '#8b5cf6' },
                { label: 'Output', color: '#7c3aed' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#64748b' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ML Metrics */}
          <div ref={metricsRef}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-bold text-lg mb-4" style={{ color: '#e2e8f0' }}>
                📊 ML Metrics Dashboard
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {ML_METRICS.map(metric => (
                  <MetricCard key={metric.label} metric={metric} inView={metricsInView} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

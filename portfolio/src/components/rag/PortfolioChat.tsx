'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';


const QUICK_QUESTIONS = [
  "What projects has Jay built?",
  "What are Jay's strongest skills?",
  "Has Jay worked with RAG and LLMs?",
  "Why should we hire Jay?",
  "Is Jay available for internships?",
];

const PIPELINE_STEPS = ['Query', 'Embed', 'Retrieve', 'LLM', 'Answer'];

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  tokensUsed?: number;
}

export default function PortfolioChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hi! 👋 I'm an AI assistant with full knowledge of Jay Wani's resume, projects, and skills. Ask me anything about Jay's background, experience, or why you should hire him!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState(-1);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);

    // Animate pipeline steps
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setActivePipelineStep(i);
      await new Promise(r => setTimeout(r, 250));
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        tokensUsed: data.tokens_used,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your GROQ_API_KEY in .env.local.`,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setActivePipelineStep(-1);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <section
      id="ai-chat"
      ref={sectionRef}
      className="section-reveal py-24 relative"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-tag">AI Portfolio Chat</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            Ask <span style={{ color: '#7c3aed' }}>AI</span> About Jay
          </h2>
          <p className="mt-3 font-mono text-sm" style={{ color: '#64748b' }}>
            Powered by Llama 3.3 · Pre-loaded with Jay&apos;s full resume · Live RAG pipeline
          </p>
        </div>

        <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a1020', borderColor: '#1a2540' }}>
          {/* Status bar */}
          <div
            className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: '#1a2540', background: '#050a12' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span className="text-xs font-mono" style={{ color: '#22c55e' }}>AI System Online</span>
            </div>
            {/* Pipeline steps */}
            <div className="hidden sm:flex items-center gap-1.5">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-1">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded transition-all duration-300"
                    style={{
                      color: activePipelineStep === i ? '#00d4aa' : '#1a2540',
                      background: activePipelineStep === i ? 'rgba(0,212,170,0.1)' : 'transparent',
                    }}
                  >
                    {step}
                  </span>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <span className="text-xs" style={{ color: '#1a2540' }}>→</span>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs font-mono" style={{ color: '#64748b' }}>llama-3.3-70b</span>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="overflow-y-auto p-5 space-y-4" style={{ maxHeight: '420px' }}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div style={{ maxWidth: '85%' }}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: 'rgba(124,58,237,0.2)', color: '#7c3aed' }}
                      >
                        AI
                      </div>
                      <span className="text-xs font-mono" style={{ color: '#64748b' }}>Jay&apos;s Assistant</span>
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#e2e8f0' }}>
                      {msg.content}
                    </p>
                    {msg.tokensUsed !== undefined && msg.tokensUsed > 0 && (
                      <p className="text-xs mt-2 font-mono" style={{ color: '#64748b' }}>
                        {msg.tokensUsed} tokens used
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="chat-bubble-ai flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" style={{ color: '#7c3aed' }} />
                  <span className="text-sm font-mono" style={{ color: '#64748b' }}>Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick questions */}
          <div className="px-5 pb-3 border-t pt-3" style={{ borderColor: '#1a2540' }}>
            <p className="text-xs font-mono mb-2" style={{ color: '#64748b' }}>Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="text-xs font-mono px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: 'rgba(124,58,237,0.08)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    color: '#7c3aed',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget).style.background = 'rgba(124,58,237,0.15)';
                    (e.currentTarget).style.borderColor = 'rgba(124,58,237,0.4)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget).style.background = 'rgba(124,58,237,0.08)';
                    (e.currentTarget).style.borderColor = 'rgba(124,58,237,0.2)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 border-t" style={{ borderColor: '#1a2540' }}>
            <div className="flex gap-3">
              <input
                id="portfolio-chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask anything about Jay Wani..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-mono outline-none transition-all duration-200"
                style={{
                  background: '#050a12',
                  border: '1px solid #1a2540',
                  color: '#e2e8f0',
                }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = '#1a2540')}
              />
              <button
                id="portfolio-chat-send"
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-40"
                style={{ background: '#7c3aed', color: '#fff' }}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Zap size={16} />
                    <span className="hidden sm:inline text-sm">Ask</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

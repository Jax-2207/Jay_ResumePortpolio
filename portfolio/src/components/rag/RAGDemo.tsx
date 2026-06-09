'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PIPELINE_STEPS = ['Upload', 'Extract', 'Chunk', 'Embed', 'Index', 'Ready'];

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  chunks?: { chunk_index: number; text: string; relevance_score: number }[];
  inferenceTime?: number;
  tokensUsed?: number;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
  sessionId?: string;
  chunkCount?: number;
  processingTime?: number;
  filename?: string;
  error?: string;
  progress: number;
}

export default function RAGDemo() {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploadState({ status: 'uploading', progress: 10 });
    setActivePipelineStep(0);

    // Simulate progress through pipeline steps
    const progressTimer = setInterval(() => {
      setUploadState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 8, 85),
      }));
    }, 200);

    // Animate steps
    for (let i = 0; i < PIPELINE_STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 400));
      setActivePipelineStep(i + 1);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      clearInterval(progressTimer);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      setUploadState({
        status: 'done',
        progress: 100,
        sessionId: data.session_id,
        chunkCount: data.chunk_count,
        processingTime: data.processing_time_ms,
        filename: data.filename,
      });
      setActivePipelineStep(5);
    } catch (err) {
      clearInterval(progressTimer);
      setUploadState({
        status: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : 'Upload failed. Is the backend running?',
      });
      setActivePipelineStep(-1);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleQuery = async () => {
    if (!query.trim() || !uploadState.sessionId || isQuerying) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsQuerying(true);

    // Animate pipeline
    for (let i = 0; i < 4; i++) {
      setActivePipelineStep(i);
      await new Promise(r => setTimeout(r, 300));
    }

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content, session_id: uploadState.sessionId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Query failed');
      }

      const data = await res.json();
      setActivePipelineStep(5);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.answer,
        chunks: data.chunks,
        inferenceTime: data.inference_time_ms,
        tokensUsed: data.tokens_used,
      };
      setMessages(prev => [...prev, aiMsg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Error: ${err instanceof Error ? err.message : 'Query failed'}. Make sure the backend is running at ${API_URL}.`,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsQuerying(false);
      setTimeout(() => setActivePipelineStep(-1), 1000);
    }
  };

  return (
    <section
      id="rag-demo"
      ref={sectionRef}
      className="py-24 relative"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="section-tag">Live RAG System</span>
          <h2 className="text-4xl font-black mt-3" style={{ color: '#e2e8f0' }}>
            Upload Any File, <span style={{ color: '#00d4aa' }}>Ask Anything</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto font-mono text-sm" style={{ color: '#64748b' }}>
            This is a working RAG pipeline built by Jay. Drop any PDF, TXT, or DOCX and query it with AI.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border"
            style={{ background: '#0a1020', borderColor: '#1a2540' }}
          >
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="text-xs font-mono px-2.5 py-1 rounded transition-all duration-300"
                  style={{
                    background: activePipelineStep >= i ? 'rgba(0,212,170,0.15)' : 'rgba(26,37,64,0.5)',
                    color: activePipelineStep >= i ? '#00d4aa' : '#64748b',
                    border: `1px solid ${activePipelineStep >= i ? 'rgba(0,212,170,0.4)' : '#1a2540'}`,
                    boxShadow: activePipelineStep === i ? '0 0 10px rgba(0,212,170,0.3)' : 'none',
                  }}
                >
                  {step}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <span className="text-xs" style={{ color: activePipelineStep > i ? '#00d4aa' : '#1a2540' }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload */}
          <div className="rounded-2xl border p-6" style={{ background: '#0a1020', borderColor: '#1a2540' }}>
            <h3 className="font-bold text-base mb-4" style={{ color: '#e2e8f0' }}>
              📂 File Upload
            </h3>

            {uploadState.status === 'idle' || uploadState.status === 'error' ? (
              <>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: isDragging ? '#00d4aa' : '#1a2540',
                    background: isDragging ? 'rgba(0,212,170,0.05)' : 'transparent',
                  }}
                  id="file-drop-zone"
                >
                  <Upload
                    size={36}
                    className="mx-auto mb-4"
                    style={{ color: isDragging ? '#00d4aa' : '#64748b' }}
                  />
                  <p className="font-mono text-sm mb-1" style={{ color: '#94a3b8' }}>
                    Drop PDF, TXT, or DOCX here
                  </p>
                  <p className="font-mono text-xs" style={{ color: '#64748b' }}>
                    or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                    id="file-upload-input"
                  />
                </div>
                {uploadState.error && (
                  <div
                    className="mt-3 p-3 rounded-lg flex items-start gap-2 text-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    {uploadState.error}
                  </div>
                )}
              </>
            ) : uploadState.status === 'uploading' || uploadState.status === 'processing' ? (
              <div className="text-center py-8">
                <Loader2 size={36} className="mx-auto mb-4 animate-spin" style={{ color: '#00d4aa' }} />
                <p className="font-mono text-sm mb-4" style={{ color: '#94a3b8' }}>
                  Processing your document...
                </p>
                <div className="skill-bar mb-2">
                  <div className="skill-bar-fill" style={{ width: `${uploadState.progress}%`, transition: 'width 0.3s ease' }} />
                </div>
                <p className="text-xs font-mono" style={{ color: '#64748b' }}>{Math.round(uploadState.progress)}%</p>
              </div>
            ) : (
              <div>
                <div
                  className="p-4 rounded-xl mb-4 flex items-start gap-3"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}
                >
                  <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <div>
                    <p className="font-mono text-sm font-bold" style={{ color: '#22c55e' }}>
                      ✓ File processed — {uploadState.chunkCount} chunks indexed
                    </p>
                    <p className="font-mono text-xs mt-1" style={{ color: '#64748b' }}>
                      {uploadState.filename} · {uploadState.processingTime}ms
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Chunks Indexed', value: uploadState.chunkCount },
                    { label: 'Processing Time', value: `${uploadState.processingTime}ms` },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="p-3 rounded-lg text-center"
                      style={{ background: '#1a2540' }}
                    >
                      <div className="text-lg font-black font-mono" style={{ color: '#00d4aa' }}>
                        {stat.value}
                      </div>
                      <div className="text-xs font-mono" style={{ color: '#64748b' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setUploadState({ status: 'idle', progress: 0 });
                    setMessages([]);
                    setActivePipelineStep(-1);
                  }}
                  className="mt-3 w-full py-2 rounded-lg text-xs font-mono transition-all duration-200"
                  style={{ background: '#1a2540', color: '#64748b' }}
                  id="reset-upload-btn"
                >
                  Upload different file
                </button>
              </div>
            )}
          </div>

          {/* Right: Query */}
          <div className="rounded-2xl border p-6 flex flex-col" style={{ background: '#0a1020', borderColor: '#1a2540', minHeight: '400px' }}>
            <h3 className="font-bold text-base mb-4 flex-shrink-0" style={{ color: '#e2e8f0' }}>
              💬 Query Interface
              {uploadState.status === 'done' && (
                <span
                  className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                >
                  ● Ready
                </span>
              )}
            </h3>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3" style={{ maxHeight: '300px' }}>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={32} className="mx-auto mb-3" style={{ color: '#1a2540' }} />
                  <p className="font-mono text-sm" style={{ color: '#64748b' }}>
                    {uploadState.status === 'done'
                      ? 'Ask anything about the uploaded document...'
                      : 'Upload a file to start querying'}
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <AnimatePresence key={msg.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>
                        {msg.content}
                      </p>
                      {msg.chunks && msg.chunks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {msg.chunks.map((chunk, ci) => (
                            <div
                              key={ci}
                              className="text-xs p-2 rounded-lg"
                              style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.1)' }}
                            >
                              <span style={{ color: '#00d4aa' }}>Chunk {chunk.chunk_index}</span>
                              <span style={{ color: '#64748b' }}> · Score: {chunk.relevance_score}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.inferenceTime && (
                        <p className="text-xs mt-2 font-mono" style={{ color: '#64748b' }}>
                          {msg.inferenceTime}ms · {msg.tokensUsed} tokens
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ))
              )}
              {isQuerying && (
                <div className="chat-bubble-ai flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" style={{ color: '#00d4aa' }} />
                  <span className="text-sm font-mono" style={{ color: '#64748b' }}>
                    Retrieving chunks and querying AI...
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 flex-shrink-0">
              <input
                id="rag-query-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuery()}
                placeholder={uploadState.status === 'done' ? 'Ask anything about the document...' : 'Upload a file first...'}
                disabled={uploadState.status !== 'done' || isQuerying}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono outline-none transition-all duration-200"
                style={{
                  background: '#1a2540',
                  border: '1px solid #1a2540',
                  color: '#e2e8f0',
                }}
                onFocus={e => (e.target.style.borderColor = '#00d4aa')}
                onBlur={e => (e.target.style.borderColor = '#1a2540')}
              />
              <button
                onClick={handleQuery}
                disabled={uploadState.status !== 'done' || !query.trim() || isQuerying}
                id="rag-send-btn"
                className="px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-40"
                style={{ background: '#00d4aa', color: '#050a12' }}
              >
                {isQuerying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Backend setup note */}
        <div
          className="mt-6 p-4 rounded-xl text-sm font-mono text-center"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}
        >
          ⚡ Backend required: <code>cd backend && pip install -r requirements.txt && python main.py</code>
        </div>
      </div>
    </section>
  );
}

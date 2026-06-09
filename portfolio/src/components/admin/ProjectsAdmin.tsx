'use client';

import { useState } from 'react';
import AdminGrid from './AdminGrid';
import { Loader2 } from 'lucide-react';

export default function ProjectsAdmin({ password }: { password: string }) {
  const renderCard = (project: any) => (
    <div className="p-6 flex flex-col h-full relative">
      <div className="h-1 w-full absolute top-0 left-0" style={{ background: `linear-gradient(90deg, ${project.accent || '#00d4aa'}, transparent)` }} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-3xl">{project.icon || '🚀'}</span>
          <h3 className="text-xl font-black mt-2" style={{ color: '#e2e8f0' }}>{project.title}</h3>
          <p className="text-sm font-mono" style={{ color: project.accent || '#00d4aa' }}>{project.subtitle}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-5 flex-1 line-clamp-3" style={{ color: '#94a3b8' }}>
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-5">
        {project.tags?.slice(0,3).map((tag: string) => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[#1a2540] text-[#94a3b8]">{tag}</span>
        ))}
        {project.tags?.length > 3 && <span className="text-xs px-2 py-1 rounded-full bg-[#1a2540] text-[#94a3b8]">+{project.tags.length - 3}</span>}
      </div>
    </div>
  );

  const renderForm = (item: any, onSubmit: any, onCancel: any, isSaving: boolean) => {
    // We need a local wrapper to handle state before submission
    return <ProjectForm item={item} onSubmit={onSubmit} onCancel={onCancel} isSaving={isSaving} />;
  };

  return (
    <AdminGrid
      password={password}
      endpoint="/api/projects"
      title="Projects"
      subtitle="Manage your 'Things I've Built' section."
      renderCard={renderCard}
      renderForm={renderForm}
    />
  );
}

function ProjectForm({ item, onSubmit, onCancel, isSaving }: any) {
  const [title, setTitle] = useState(item?.title || '');
  const [subtitle, setSubtitle] = useState(item?.subtitle || '');
  const [description, setDescription] = useState(item?.description || '');
  const [live, setLive] = useState(item?.live || '');
  const [github, setGithub] = useState(item?.github || '');
  const [tagsStr, setTagsStr] = useState(item?.tags?.join(', ') || '');
  const [metric, setMetric] = useState(item?.metric || '');
  const [metricColor, setMetricColor] = useState(item?.metricColor || '#22c55e');
  const [accent, setAccent] = useState(item?.accent || '#00d4aa');
  const [icon, setIcon] = useState(item?.icon || '🚀');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      title, subtitle, description, live, github,
      tags: tagsStr.split(',').map((s: string) => s.trim()).filter(Boolean),
      metric, metricColor, accent, icon
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Title</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Subtitle</label><input required value={subtitle} onChange={e=>setSubtitle(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Description</label><textarea required rows={3} value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Live URL</label><input value={live} onChange={e=>setLive(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Github URL</label><input value={github} onChange={e=>setGithub(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Tags (Comma separated)</label><input required value={tagsStr} onChange={e=>setTagsStr(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Metric Text</label><input required value={metric} onChange={e=>setMetric(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Icon (Emoji)</label><input required value={icon} onChange={e=>setIcon(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Accent Color</label><input type="color" value={accent} onChange={e=>setAccent(e.target.value)} className="w-full h-10 p-1 rounded bg-[#050a12] border border-[#1a2540] cursor-pointer" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Metric Color</label><input type="color" value={metricColor} onChange={e=>setMetricColor(e.target.value)} className="w-full h-10 p-1 rounded bg-[#050a12] border border-[#1a2540] cursor-pointer" /></div>
      </div>
      <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2540]">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-slate-400 hover:text-white font-bold">Cancel</button>
        <button disabled={isSaving} type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save Project
        </button>
      </div>
    </form>
  );
}

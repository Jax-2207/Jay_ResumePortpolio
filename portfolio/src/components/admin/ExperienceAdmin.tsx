'use client';

import { useState } from 'react';
import AdminGrid from './AdminGrid';
import { Loader2 } from 'lucide-react';

export default function ExperienceAdmin({ password }: { password: string }) {
  const renderCard = (exp: any) => (
    <div className="p-6 border-l-4" style={{ borderLeftColor: exp.typeColor || '#00d4aa' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>{exp.icon || '💼'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${exp.typeColor}15`, color: exp.typeColor, border: `1px solid ${exp.typeColor}30` }}>
              {exp.type}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">{exp.role}</h3>
          <p className="font-mono font-semibold" style={{ color: exp.typeColor }}>@ {exp.company}</p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded-full bg-[#1a2540] text-slate-400">{exp.period}</span>
      </div>
      <ul className="text-xs space-y-1 mb-3 text-slate-400 line-clamp-2">
        {exp.points?.map((p: string, i: number) => <li key={i}>• {p}</li>)}
      </ul>
    </div>
  );

  const renderForm = (item: any, onSubmit: any, onCancel: any, isSaving: boolean) => {
    return <ExperienceForm item={item} onSubmit={onSubmit} onCancel={onCancel} isSaving={isSaving} />;
  };

  return (
    <AdminGrid
      password={password}
      endpoint="/api/experience"
      title="Experience"
      subtitle="Manage your work experience and roles."
      renderCard={renderCard}
      renderForm={renderForm}
    />
  );
}

function ExperienceForm({ item, onSubmit, onCancel, isSaving }: any) {
  const [role, setRole] = useState(item?.role || '');
  const [company, setCompany] = useState(item?.company || '');
  const [period, setPeriod] = useState(item?.period || '');
  const [type, setType] = useState(item?.type || 'Internship');
  const [typeColor, setTypeColor] = useState(item?.typeColor || '#00d4aa');
  const [pointsStr, setPointsStr] = useState(item?.points?.join('\\n') || '');
  const [stackStr, setStackStr] = useState(item?.stack?.join(', ') || '');
  const [icon, setIcon] = useState(item?.icon || '💼');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      role, company, period, type, typeColor, icon,
      points: pointsStr.split('\\n').map((s: string) => s.trim()).filter(Boolean),
      stack: stackStr.split(',').map((s: string) => s.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Role</label><input required value={role} onChange={e=>setRole(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Company</label><input required value={company} onChange={e=>setCompany(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Period</label><input required value={period} onChange={e=>setPeriod(e.target.value)} placeholder="e.g. Jun 2024 - Aug 2024" className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Type</label><input required value={type} onChange={e=>setType(e.target.value)} placeholder="e.g. Internship" className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Points (One per line)</label><textarea required rows={4} value={pointsStr} onChange={e=>setPointsStr(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Tech Stack (Comma separated)</label><input required value={stackStr} onChange={e=>setStackStr(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Icon (Emoji)</label><input required value={icon} onChange={e=>setIcon(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Theme Color</label><input type="color" value={typeColor} onChange={e=>setTypeColor(e.target.value)} className="w-full h-10 p-1 rounded bg-[#050a12] border border-[#1a2540] cursor-pointer" /></div>
      </div>
      <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2540]">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-slate-400 hover:text-white font-bold">Cancel</button>
        <button disabled={isSaving} type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save Experience
        </button>
      </div>
    </form>
  );
}

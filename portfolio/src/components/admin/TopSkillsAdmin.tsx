'use client';

import { useState } from 'react';
import AdminGrid from './AdminGrid';
import { Loader2 } from 'lucide-react';

export default function TopSkillsAdmin({ password }: { password: string }) {
  const renderCard = (skill: any) => (
    <div className="p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-mono font-medium text-slate-300">{skill.name}</span>
        <span className="text-sm font-mono font-bold text-[#00d4aa]">{skill.pct}%</span>
      </div>
      <div className="h-2 w-full bg-[#1a2540] rounded-full overflow-hidden mt-3">
        <div className="h-full bg-[#00d4aa] rounded-full" style={{ width: `${skill.pct}%` }} />
      </div>
    </div>
  );

  const renderForm = (item: any, onSubmit: any, onCancel: any, isSaving: boolean) => {
    return <TopSkillForm item={item} onSubmit={onSubmit} onCancel={onCancel} isSaving={isSaving} />;
  };

  return (
    <AdminGrid
      password={password}
      endpoint="/api/top-skills"
      title="Top Skills (Bars)"
      subtitle="Manage your highlighted skills and percentages."
      renderCard={renderCard}
      renderForm={renderForm}
    />
  );
}

function TopSkillForm({ item, onSubmit, onCancel, isSaving }: any) {
  const [name, setName] = useState(item?.name || '');
  const [pct, setPct] = useState(item?.pct || 80);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({ name, pct: Number(pct) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Skill Name</label><input required value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Percentage (0-100)</label><input required type="number" min="0" max="100" value={pct} onChange={e=>setPct(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
      </div>
      <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2540]">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-slate-400 hover:text-white font-bold">Cancel</button>
        <button disabled={isSaving} type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save Skill
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import AdminGrid from './AdminGrid';
import { Loader2 } from 'lucide-react';

export default function SkillGroupsAdmin({ password }: { password: string }) {
  const renderCard = (group: any) => (
    <div className="p-5">
      <div className="text-2xl mb-3">{group.icon || '🛠️'}</div>
      <h3 className="font-bold text-sm mb-4" style={{ color: '#00d4aa', fontFamily: 'var(--font-mono)' }}>{group.title}</h3>
      <div className="flex flex-wrap gap-2">
        {group.tags?.slice(0,5).map((tag: string) => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a2540] text-slate-400">{tag}</span>)}
        {group.tags?.length > 5 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a2540] text-slate-400">+{group.tags.length - 5}</span>}
      </div>
    </div>
  );

  const renderForm = (item: any, onSubmit: any, onCancel: any, isSaving: boolean) => {
    return <SkillGroupForm item={item} onSubmit={onSubmit} onCancel={onCancel} isSaving={isSaving} />;
  };

  return (
    <AdminGrid
      password={password}
      endpoint="/api/skill-groups"
      title="Skill Groups"
      subtitle="Manage your skill categories (e.g. Frontend, Backend)."
      renderCard={renderCard}
      renderForm={renderForm}
    />
  );
}

function SkillGroupForm({ item, onSubmit, onCancel, isSaving }: any) {
  const [title, setTitle] = useState(item?.title || '');
  const [icon, setIcon] = useState(item?.icon || '🛠️');
  const [tagsStr, setTagsStr] = useState(item?.tags?.join(', ') || '');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      title, icon,
      tags: tagsStr.split(',').map((s: string) => s.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Group Title</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Icon (Emoji)</label><input required value={icon} onChange={e=>setIcon(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Skills (Comma separated)</label><textarea required rows={3} value={tagsStr} onChange={e=>setTagsStr(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
      </div>
      <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2540]">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-slate-400 hover:text-white font-bold">Cancel</button>
        <button disabled={isSaving} type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save Group
        </button>
      </div>
    </form>
  );
}

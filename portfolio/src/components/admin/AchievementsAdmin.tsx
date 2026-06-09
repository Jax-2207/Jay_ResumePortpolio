'use client';

import { useState } from 'react';
import AdminGrid from './AdminGrid';
import { Loader2, Upload, Trash2 } from 'lucide-react';

export default function AchievementsAdmin({ password }: { password: string }) {
  const renderCard = (ach: any) => (
    <div className="flex flex-col h-full bg-[#0a1020] p-6 border-t-4" style={{ borderColor: ach.color || '#00d4aa' }}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{ach.icon || '🏆'}</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${ach.color}15`, color: ach.color, border: `1px solid ${ach.color}30` }}>
          {ach.badge}
        </span>
      </div>
      <h3 className="text-lg font-black mb-1" style={{ color: ach.color }}>{ach.title}</h3>
      <p className="text-sm font-semibold mb-3 text-[#e2e8f0]">{ach.subtitle}</p>
      <p className="text-xs leading-relaxed text-[#64748b] mb-4">{ach.description}</p>
      
      {ach.certificates && ach.certificates.length > 0 && (
        <div className="mt-auto pt-4 border-t border-[#1a2540] flex flex-wrap gap-2">
          {ach.certificates.map((cert: any, idx: number) => (
            <div key={idx} className="text-[10px] px-2 py-1 rounded bg-[#1a2540] text-slate-300">
              {cert.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderForm = (item: any, onSubmit: any, onCancel: any, isSaving: boolean, password: string) => {
    return <AchievementForm item={item} onSubmit={onSubmit} onCancel={onCancel} isSaving={isSaving} password={password} />;
  };

  return (
    <AdminGrid
      password={password}
      endpoint="/api/achievements"
      title="Achievements"
      subtitle="Manage your certificates and awards."
      renderCard={renderCard}
      renderForm={renderForm}
    />
  );
}

function AchievementForm({ item, onSubmit, onCancel, isSaving, password }: any) {
  const [title, setTitle] = useState(item?.title || '');
  const [subtitle, setSubtitle] = useState(item?.subtitle || '');
  const [description, setDescription] = useState(item?.description || '');
  const [icon, setIcon] = useState(item?.icon || '🏆');
  const [badge, setBadge] = useState(item?.badge || '');
  const [color, setColor] = useState(item?.color || '#f59e0b');
  const [certificates, setCertificates] = useState<{title: string, url: string}[]>(item?.certificates || []);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${password}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const certTitle = prompt('Enter a title for this certificate:', file.name) || file.name;
      setCertificates(prev => [...prev, { title: certTitle, url: data.secure_url }]);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    onSubmit({ title, subtitle, description, icon, badge, color, certificates });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Title</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Subtitle</label><input required value={subtitle} onChange={e=>setSubtitle(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Description</label><textarea required rows={3} value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Icon (Emoji)</label><input required value={icon} onChange={e=>setIcon(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Badge Text</label><input required value={badge} onChange={e=>setBadge(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Theme Color</label><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-10 p-1 rounded bg-[#050a12] border border-[#1a2540] cursor-pointer" /></div>
      </div>

      <div className="pt-4 border-t border-[#1a2540]">
        <h3 className="text-sm font-bold text-white mb-3">Certificates</h3>
        <div className="space-y-2 mb-3">
          {certificates.map((cert, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#050a12] border border-[#1a2540]">
              <span className="text-xs text-slate-300">{cert.title}</span>
              <button type="button" onClick={() => setCertificates(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="relative">
          <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
          <div className={`flex items-center justify-center gap-2 w-full py-3 rounded border-2 border-dashed ${isUploading ? 'border-purple-500/50 text-purple-400' : 'border-[#1a2540] text-slate-400 hover:border-purple-500'}`}>
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-xs">{isUploading ? 'Uploading...' : 'Upload Certificate'}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2540]">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-slate-400 hover:text-white font-bold">Cancel</button>
        <button disabled={isSaving} type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save Achievement
        </button>
      </div>
    </form>
  );
}

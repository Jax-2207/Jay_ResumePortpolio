'use client';

import { useState } from 'react';
import AdminGrid from './AdminGrid';
import { Loader2 } from 'lucide-react';

export default function CustomSectionsAdmin({ password }: { password: string }) {
  const renderCard = (section: any) => (
    <div className="p-6">
      <div className="text-xs text-slate-500 mb-1 font-mono">{section.sectionId}</div>
      <h3 className="text-lg font-bold text-[#00d4aa] mb-2">{section.sectionTitle}</h3>
      {section.sectionSubtitle && <p className="text-sm text-slate-300 mb-4">{section.sectionSubtitle}</p>}
      <div className="text-xs text-slate-400">{section.items?.length || 0} items configured</div>
    </div>
  );

  const renderForm = (item: any, onSubmit: any, onCancel: any, isSaving: boolean) => {
    return <CustomSectionForm item={item} onSubmit={onSubmit} onCancel={onCancel} isSaving={isSaving} />;
  };

  return (
    <AdminGrid
      password={password}
      endpoint="/api/custom-sections"
      title="Custom Sections"
      subtitle="Build entirely new sections with custom cards."
      renderCard={renderCard}
      renderForm={renderForm}
    />
  );
}

function CustomSectionForm({ item, onSubmit, onCancel, isSaving }: any) {
  const [sectionId, setSectionId] = useState(item?.sectionId || '');
  const [sectionTitle, setSectionTitle] = useState(item?.sectionTitle || '');
  const [sectionSubtitle, setSectionSubtitle] = useState(item?.sectionSubtitle || '');
  const [items, setItems] = useState<any[]>(item?.items || []);

  const handleAddItem = () => {
    setItems([...items, { title: 'New Item', subtitle: '', description: '', icon: '✨', tags: [], color: '#00d4aa', link: '' }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({ sectionId, sectionTitle, sectionSubtitle, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Section ID (Unique, e.g. "inside-machine")</label><input required value={sectionId} onChange={e=>setSectionId(e.target.value.toLowerCase().replace(/\\s+/g, '-'))} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white font-mono" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Section Tag (Title)</label><input required value={sectionTitle} onChange={e=>setSectionTitle(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Section Header (Subtitle)</label><input value={sectionSubtitle} onChange={e=>setSectionSubtitle(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
      </div>

      <div className="border-t border-[#1a2540] pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">Cards ({items.length})</h3>
          <button type="button" onClick={handleAddItem} className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-500/30 font-bold">+ Add Card</button>
        </div>
        
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          {items.map((card, i) => (
            <div key={i} className="p-4 border border-[#1a2540] rounded-xl bg-[#050a12] relative">
              <button type="button" onClick={() => removeItem(i)} className="absolute top-2 right-2 text-red-500 text-xs">Remove</button>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-[10px] text-slate-500 uppercase">Title</label><input required value={card.title} onChange={e=>updateItem(i, 'title', e.target.value)} className="w-full p-1.5 text-sm bg-[#0a1020] border border-[#1a2540] rounded text-white" /></div>
                <div><label className="block text-[10px] text-slate-500 uppercase">Subtitle</label><input value={card.subtitle} onChange={e=>updateItem(i, 'subtitle', e.target.value)} className="w-full p-1.5 text-sm bg-[#0a1020] border border-[#1a2540] rounded text-white" /></div>
                <div className="col-span-2"><label className="block text-[10px] text-slate-500 uppercase">Description</label><input value={card.description} onChange={e=>updateItem(i, 'description', e.target.value)} className="w-full p-1.5 text-sm bg-[#0a1020] border border-[#1a2540] rounded text-white" /></div>
                <div><label className="block text-[10px] text-slate-500 uppercase">Icon</label><input value={card.icon} onChange={e=>updateItem(i, 'icon', e.target.value)} className="w-full p-1.5 text-sm bg-[#0a1020] border border-[#1a2540] rounded text-white" /></div>
                <div><label className="block text-[10px] text-slate-500 uppercase">Color</label><input type="color" value={card.color} onChange={e=>updateItem(i, 'color', e.target.value)} className="w-full h-8 p-0 border-0 rounded cursor-pointer" /></div>
                <div><label className="block text-[10px] text-slate-500 uppercase">Link URL</label><input value={card.link} onChange={e=>updateItem(i, 'link', e.target.value)} className="w-full p-1.5 text-sm bg-[#0a1020] border border-[#1a2540] rounded text-white" /></div>
                <div><label className="block text-[10px] text-slate-500 uppercase">Tags (comma sep)</label><input value={card.tags?.join(',')} onChange={e=>updateItem(i, 'tags', e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean))} className="w-full p-1.5 text-sm bg-[#0a1020] border border-[#1a2540] rounded text-white" /></div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-xs text-slate-500 text-center py-4">No cards added.</div>}
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2540]">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-slate-400 hover:text-white font-bold">Cancel</button>
        <button disabled={isSaving} type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save Section
        </button>
      </div>
    </form>
  );
}

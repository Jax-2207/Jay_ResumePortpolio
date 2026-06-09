'use client';

import { useState } from 'react';
import AdminGrid from './AdminGrid';
import { Loader2 } from 'lucide-react';

export default function ContactAdmin({ password }: { password: string }) {
  const renderCard = (contact: any) => (
    <div className="p-6 flex items-center gap-4 h-full relative" style={{ borderColor: contact.color || '#0a1020', borderWidth: '1px', borderStyle: 'solid' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: `${contact.color || '#ffffff'}15`, color: contact.color }}>
        {contact.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono uppercase tracking-widest mb-1 text-slate-500">{contact.description}</div>
        <div className="font-semibold text-sm truncate text-white">{contact.value}</div>
      </div>
    </div>
  );

  const renderForm = (item: any, onSubmit: any, onCancel: any, isSaving: boolean) => {
    return <ContactForm item={item} onSubmit={onSubmit} onCancel={onCancel} isSaving={isSaving} />;
  };

  return (
    <AdminGrid
      password={password}
      endpoint="/api/contact"
      title="Contact Methods"
      subtitle="Manage your Let's Connect links."
      renderCard={renderCard}
      renderForm={renderForm}
    />
  );
}

function ContactForm({ item, onSubmit, onCancel, isSaving }: any) {
  const [label, setLabel] = useState(item?.label || '');
  const [value, setValue] = useState(item?.value || '');
  const [href, setHref] = useState(item?.href || '');
  const [icon, setIcon] = useState(item?.icon || '📧');
  const [color, setColor] = useState(item?.color || '#00d4aa');
  const [description, setDescription] = useState(item?.description || '');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({ label, value, href, icon, color, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Label</label><input required value={label} onChange={e=>setLabel(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Value (Text shown)</label><input required value={value} onChange={e=>setValue(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">URL (href)</label><input required value={href} onChange={e=>setHref(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div><label className="block text-xs font-mono text-slate-400 mb-1">Icon (Emoji)</label><input required value={icon} onChange={e=>setIcon(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Description</label><input required value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 rounded bg-[#050a12] border border-[#1a2540] outline-none text-white" /></div>
        <div className="col-span-2"><label className="block text-xs font-mono text-slate-400 mb-1">Color</label><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-10 p-1 rounded bg-[#050a12] border border-[#1a2540] cursor-pointer" /></div>
      </div>
      <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2540]">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-slate-400 hover:text-white font-bold">Cancel</button>
        <button disabled={isSaving} type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-2">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save Contact
        </button>
      </div>
    </form>
  );
}

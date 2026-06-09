'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, GripVertical, Trash2, Edit3, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItemWrapper({ id, children, isDraggingNode }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group h-full list-none ${isDragging ? 'shadow-2xl shadow-purple-500/20' : ''}`}>
      {children(isDragging, attributes, listeners)}
    </div>
  );
}

export default function AdminGrid({
  password,
  endpoint,
  title,
  subtitle,
  renderCard,
  renderForm
}: {
  password: string,
  endpoint: string,
  title: string,
  subtitle: string,
  renderCard: (item: any) => React.ReactNode,
  renderForm: (item: any | null, onSubmit: (data: any) => Promise<void>, onCancel: () => void, isSaving: boolean, password: string) => React.ReactNode
}) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);
    const newOrder = arrayMove(items, oldIndex, newIndex);
    
    setItems(newOrder);
    
    try {
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      console.error('Failed to save order', err);
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: any) => {
    setIsSaving(true);
    try {
      const isEditing = !!editingItem;
      const body = isEditing ? { _id: editingItem._id, ...payload } : { ...payload, order: items.length };

      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to save');
      
      setIsModalOpen(false);
      fetchItems();
      setMessage(isEditing ? 'Updated successfully!' : 'Added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await fetch(`${endpoint}?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${password}` }
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors">
          <Plus size={18} /> Add New
        </button>
      </div>

      {message && <div className="mb-8 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-sm text-center">{message}</div>}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-500 py-12 border border-dashed border-[#1a2540] rounded-xl">No items yet. Click "Add New" to create one.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(a => a._id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <SortableItemWrapper key={item._id} id={item._id}>
                  {(isDragging: boolean, attributes: any, listeners: any) => (
                    <div className="relative group h-full">
                      {/* Admin Overlays */}
                      <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => openModal(item)} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg backdrop-blur-md">
                          <Edit3 size={16} />
                        </button>
                        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => handleDelete(item._id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg backdrop-blur-md">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div {...attributes} {...listeners} className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 p-2 cursor-grab active:cursor-grabbing hover:text-white bg-black/40 rounded backdrop-blur-sm">
                        <GripVertical size={18} />
                      </div>

                      <div className="h-full pointer-events-none border border-[#1a2540] rounded-xl bg-[#0a1020] overflow-hidden">
                         {renderCard(item)}
                      </div>
                    </div>
                  )}
                </SortableItemWrapper>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-[#0a1020] rounded-xl border border-[#1a2540] shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#0a1020] border-b border-[#1a2540]">
                <h2 className="text-xl font-bold">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6">
                 {renderForm(editingItem, handleSubmit, () => setIsModalOpen(false), isSaving, password)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

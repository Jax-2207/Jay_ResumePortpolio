'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, Briefcase, Code, Award, Target, FolderKanban, Component } from 'lucide-react';
import ProjectsAdmin from '@/components/admin/ProjectsAdmin';
import SkillGroupsAdmin from '@/components/admin/SkillGroupsAdmin';
import TopSkillsAdmin from '@/components/admin/TopSkillsAdmin';
import ExperienceAdmin from '@/components/admin/ExperienceAdmin';
import AchievementsAdmin from '@/components/admin/AchievementsAdmin';
import ContactAdmin from '@/components/admin/ContactAdmin';
import CustomSectionsAdmin from '@/components/admin/CustomSectionsAdmin';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() !== '') setIsAuthenticated(true);
  };

  const tabs = [
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { id: 'skill-groups', label: 'Skill Groups', icon: <Code size={18} /> },
    { id: 'top-skills', label: 'Top Skills', icon: <Target size={18} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
    { id: 'contact', label: 'Contact Links', icon: <LayoutDashboard size={18} /> },
    { id: 'custom-sections', label: 'Custom Sections', icon: <Component size={18} /> },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#030712]">
        <div className="w-full max-w-md p-8 rounded-xl border border-[#1a2540] bg-[#0a1020]">
          <h2 className="text-2xl font-black text-white mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter Admin Password" className="w-full px-4 py-3 rounded-lg bg-[#050a12] border border-[#1a2540] text-white outline-none" required />
            <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[#1a2540] bg-[#0a1020] p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-black text-[#00d4aa] tracking-tight">Portfolio CMS</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">v2.0 Visual Editor</p>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white hover:bg-[#1a2540]'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#1a2540]">
          <button onClick={() => {setIsAuthenticated(false); setPassword('');}} className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {activeTab === 'projects' && <ProjectsAdmin password={password} />}
            {activeTab === 'skill-groups' && <SkillGroupsAdmin password={password} />}
            {activeTab === 'top-skills' && <TopSkillsAdmin password={password} />}
            {activeTab === 'experience' && <ExperienceAdmin password={password} />}
            {activeTab === 'achievements' && <AchievementsAdmin password={password} />}
            {activeTab === 'contact' && <ContactAdmin password={password} />}
            {activeTab === 'custom-sections' && <CustomSectionsAdmin password={password} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

import React from 'react';
import { LayoutDashboard, Lightbulb, Clapperboard, Calendar, BarChart3, Settings, Youtube, PlayCircle } from 'lucide-react';
import { ConnectedAccounts, AccountConfig } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  accounts?: ConnectedAccounts;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, accounts }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'ideation', label: 'Ideation Engine', icon: <Lightbulb size={20} /> },
    { id: 'production', label: 'Production Hub', icon: <Clapperboard size={20} /> },
    { id: 'calendar', label: 'Schedule', icon: <Calendar size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'System Config', icon: <Settings size={20} /> },
  ];

  const hasActiveConnection = accounts && Object.values(accounts).some((acc: AccountConfig) => acc.connected);

  return (
    <aside className="w-64 bg-dark-900 border-r border-neutral-800 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-2 border-b border-neutral-800">
        <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
          <PlayCircle className="text-black" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">ViralFlow AI</h1>
          <p className="text-xs text-gold-500 font-medium">AUTONOMOUS</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <span className={`${currentView === item.id ? 'text-gold-500' : 'text-neutral-500 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-neutral-800">
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <p className="text-xs text-neutral-400 mb-2">Connected Accounts</p>
          <div className="flex gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${accounts?.youtube.connected ? 'bg-red-900/30 text-red-500 border-red-500/20' : 'bg-neutral-800 text-neutral-600 border-neutral-700'}`}>
              <Youtube size={14} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${accounts?.instagram.connected ? 'bg-pink-900/30 text-pink-500 border-pink-500/20' : 'bg-neutral-800 text-neutral-600 border-neutral-700'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${accounts?.tiktok.connected ? 'bg-cyan-900/30 text-cyan-500 border-cyan-500/20' : 'bg-neutral-800 text-neutral-600 border-neutral-700'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasActiveConnection ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`}></div>
            <span className={`text-xs font-medium ${hasActiveConnection ? 'text-green-500' : 'text-neutral-500'}`}>
                {hasActiveConnection ? 'System Active' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
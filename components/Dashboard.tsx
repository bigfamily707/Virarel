import React from 'react';
import { TrendingUp, Users, Eye, Play, Clock, ArrowUpRight, ArrowDownRight, Zap, AlertTriangle, PlayCircle, Trash2 } from 'lucide-react';
import { StatCardProps, LogEntry, ConnectedAccounts, VideoProject } from '../types';

interface DashboardProps {
  logs: LogEntry[];
  runAutomation: () => void;
  isRunning: boolean;
  accounts: ConnectedAccounts;
  setView: (view: string) => void;
  projects: VideoProject[];
  onDeleteProject: (id: string) => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => (
  <div className="bg-dark-900 p-6 rounded-2xl border border-neutral-800 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-neutral-800 rounded-xl group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-colors">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}
      </div>
    </div>
    <h3 className="text-neutral-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-gold-500/5 to-transparent rounded-full blur-2xl group-hover:from-gold-500/10 transition-all"></div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ logs, runAutomation, isRunning, accounts, setView, projects, onDeleteProject }) => {
  const hasConnection = Object.values(accounts).some(Boolean);

  // Filter for videos that have a videoUrl (generated content)
  const videoLibrary = projects.filter(p => p.videoUrl);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Command Center</h2>
          <p className="text-neutral-400">Overview of your automated content empire.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {!hasConnection && (
             <button 
                onClick={() => setView('settings')}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 flex items-center gap-2"
             >
                <AlertTriangle size={16} /> Connect Accounts
             </button>
          )}
          <button 
            onClick={runAutomation}
            disabled={isRunning || !hasConnection}
            className={`px-6 py-2 bg-gold-600 hover:bg-gold-500 text-black rounded-lg text-sm font-bold shadow-lg shadow-gold-500/20 transition-all flex items-center gap-2 whitespace-nowrap ${
                (isRunning || !hasConnection) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRunning ? (
                <>
                    <Zap size={16} className="animate-pulse" /> Running Cycle...
                </>
            ) : (
                <>
                    <Zap size={16} fill="currentColor" /> Run Daily Cycle
                </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Views (30d)" 
          value="124.5K" 
          change="+12.3%" 
          isPositive={true} 
          icon={<Eye size={20} />} 
        />
        <StatCard 
          title="Avg. Engagement" 
          value="8.4%" 
          change="+2.1%" 
          isPositive={true} 
          icon={<TrendingUp size={20} />} 
        />
        <StatCard 
          title="Follower Growth" 
          value="+1,240" 
          change="+5.4%" 
          isPositive={true} 
          icon={<Users size={20} />} 
        />
        <StatCard 
          title="Content Published" 
          value="28" 
          change="-2" 
          isPositive={false} 
          icon={<Play size={20} />} 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Activity Feed */}
        <div className="lg:col-span-2 bg-dark-900 rounded-2xl border border-neutral-800 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Clock size={18} className="text-gold-500" /> System Activity Log
          </h3>
          <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {logs.length === 0 ? (
                <p className="text-sm text-neutral-500 pl-8">No activity recorded yet.</p>
            ) : (
                logs.map((log) => (
                <div key={log.id} className="relative flex items-start gap-4 pl-2 animate-in slide-in-from-left-2">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-dark-900 z-10 ${
                    log.type === 'publish' ? 'bg-green-500/20 text-green-500' : 
                    log.type === 'ai' ? 'bg-purple-500/20 text-purple-500' :
                    log.type === 'trend' ? 'bg-blue-500/20 text-blue-500' :
                    log.type === 'error' ? 'bg-red-500/20 text-red-500' :
                    'bg-neutral-800 text-neutral-400'
                    }`}>
                    {log.type === 'publish' ? <Play size={14} /> : log.type === 'ai' ? <Users size={14} /> : log.type === 'error' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                    </div>
                    <div>
                    <p className="text-sm text-neutral-300 font-medium">{log.text}</p>
                    <p className="text-xs text-neutral-500 mt-1">{log.time}</p>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Quick Queue */}
        <div className="bg-dark-900 rounded-2xl border border-neutral-800 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Up Next</h3>
          <div className="flex-1 space-y-4">
             {[
                { title: 'The 40% Rule', time: 'Today, 2:00 PM', platform: 'YT Shorts' },
                { title: 'Monk Mode Explained', time: 'Today, 7:00 PM', platform: 'TikTok' },
                { title: 'Dopamine Detox', time: 'Tomorrow, 12:00 PM', platform: 'IG Reels' },
             ].map((item, i) => (
               <div key={i} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex justify-between items-center group hover:border-neutral-700 transition-colors">
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-gold-500 transition-colors">{item.title}</h4>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <Clock size={10} /> {item.time}
                    </p>
                  </div>
                  <div className="text-xs font-bold px-2 py-1 bg-neutral-900 rounded text-neutral-400 border border-neutral-800">
                    {item.platform}
                  </div>
               </div>
             ))}
          </div>
          <button className="w-full mt-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-colors border border-neutral-700">
            Manage Queue
          </button>
        </div>
      </div>

      {/* Generated Video Assets Library */}
      <div className="bg-dark-900 rounded-2xl border border-neutral-800 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PlayCircle size={20} className="text-gold-500"/> Generated Video Assets
        </h3>
        {videoLibrary.length === 0 ? (
            <div className="text-center p-8 border border-neutral-800 rounded-xl border-dashed bg-neutral-950/50">
                <p className="text-neutral-500 text-sm">No videos generated yet. Run the automation cycle to create content.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {videoLibrary.map(video => (
                    <div key={video.id} className="group relative bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition-all hover:border-gold-500/50">
                        <div className="aspect-[9/16] relative bg-black">
                             {/* Use native video control for "seeing them" */}
                            <video 
                                src={video.videoUrl} 
                                className="w-full h-full object-cover" 
                                controls 
                                playsInline
                            />
                            {/* Delete Button - appears on hover */}
                            <button 
                                onClick={() => {
                                    if(confirm('Are you sure you want to delete this video asset?')) onDeleteProject(video.id)
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg z-10 backdrop-blur-sm"
                                title="Delete Asset"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="p-3">
                            <h4 className="text-white font-medium text-xs truncate mb-2" title={video.title}>{video.title}</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                                    {video.platform[0] === 'YouTube Shorts' ? 'YT Shorts' : video.platform[0]}
                                </span>
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                    video.status === 'published' ? 'text-green-500 bg-green-500/10' : 
                                    video.status === 'scheduled' ? 'text-blue-500 bg-blue-500/10' : 
                                    'text-neutral-500 bg-neutral-800'
                                }`}>
                                    {video.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
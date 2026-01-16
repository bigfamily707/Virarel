import React from 'react';
import { VideoProject } from '../types';

interface CalendarViewProps {
  projects: VideoProject[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ projects }) => {
  // Simple Mock Calendar Grid
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1); // Mock dates

  const scheduledProjects = projects.filter(p => p.status === 'scheduled');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Content Calendar</h2>
          <p className="text-neutral-400">Upcoming automated publications.</p>
        </div>
        <div className="flex gap-2">
            <span className="flex items-center text-xs text-neutral-400 gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> YouTube</span>
            <span className="flex items-center text-xs text-neutral-400 gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> TikTok</span>
            <span className="flex items-center text-xs text-neutral-400 gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div> IG</span>
        </div>
      </div>

      <div className="bg-dark-900 rounded-2xl border border-neutral-800 p-6">
        <div className="grid grid-cols-7 mb-4">
            {days.map(d => (
                <div key={d} className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wider">{d}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
            {dates.map((d, i) => {
                const dayProjects = scheduledProjects.filter((_, idx) => (idx % 28) + 1 === d);
                const isToday = d === 15; // Mock today
                
                return (
                <div key={i} className={`min-h-[100px] bg-neutral-950 rounded-lg border p-2 relative ${isToday ? 'border-gold-500/50' : 'border-neutral-800'}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-gold-500' : 'text-neutral-600'}`}>{d}</span>
                    <div className="mt-2 space-y-1">
                        {dayProjects.map((p, idx) => (
                             <div key={idx} className="text-[10px] truncate px-1.5 py-1 bg-neutral-800 rounded text-neutral-300 border-l-2 border-red-500">
                                {p.title}
                            </div>
                        ))}
                        {d % 3 === 0 && d > 15 && (
                             <div className="text-[10px] truncate px-1.5 py-1 bg-neutral-800/50 rounded text-neutral-500 border-l-2 border-neutral-700 dashed border-dashed">
                                Auto-Gen Slot
                            </div>
                        )}
                    </div>
                </div>
            )})}
        </div>
      </div>
    </div>
  );
};

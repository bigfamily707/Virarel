import React, { useState } from 'react';
import { VideoProject } from '../types';
import { FileText, Play, MonitorPlay, Loader, Calendar, X, Clock, Video } from 'lucide-react';
import { generateScript } from '../services/geminiService';
import { generateVeoVideo } from '../services/veoService';

interface ProductionHubProps {
  projects: VideoProject[];
  updateProject: (id: string, updates: Partial<VideoProject>) => void;
}

export const ProductionHub: React.FC<ProductionHubProps> = ({ projects, updateProject }) => {
  const activeProjects = projects.filter(p => ['ideation', 'scripting', 'production', 'review'].includes(p.status));
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Scheduling State
  const [schedulingProject, setSchedulingProject] = useState<VideoProject | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleCreateScript = async (project: VideoProject) => {
    setLoadingId(project.id);
    updateProject(project.id, { status: 'scripting' });
    
    // Call Gemini
    const script = await generateScript(project.topic, project.hook || '', project.platform[0]);
    
    updateProject(project.id, { 
        script, 
        status: 'production' 
    });
    setLoadingId(null);
  };

  const handleGenerateVideo = async (project: VideoProject) => {
      setLoadingId(project.id);
      
      try {
        // Use Veo Service
        const videoUrl = await generateVeoVideo(project.script || project.title);
        
        updateProject(project.id, { 
            status: 'review',
            thumbnailUrl: `https://picsum.photos/seed/${project.id}/400/700`, // Placeholder thumb
            videoUrl: videoUrl
        });
      } catch (e) {
        console.error("Video Generation Error:", e);
        // Ensure state is reset even on error
      } finally {
        setLoadingId(null);
      }
  };

  const openScheduleModal = (project: VideoProject) => {
    setSchedulingProject(project);
    // Default to tomorrow 12:00 PM or current time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    setScheduleDate(dateStr);
    setScheduleTime(timeStr);
  };

  const confirmSchedule = () => {
    if (!schedulingProject || !scheduleDate || !scheduleTime) return;
    
    const dateTimeString = `${scheduleDate}T${scheduleTime}:00`;
    const dateObj = new Date(dateTimeString);
    
    updateProject(schedulingProject.id, { 
        status: 'scheduled',
        scheduledDate: dateObj.toISOString()
    });
    
    setSchedulingProject(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Production Hub</h2>
        <p className="text-neutral-400">Manage scripting, voiceover generation, and rendering.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeProjects.length === 0 ? (
            <div className="text-center p-12 bg-dark-900 rounded-2xl border border-neutral-800 text-neutral-500">
                <p>No active projects. Go to Ideation Engine to start.</p>
            </div>
        ) : (
            activeProjects.map((project) => (
                <div key={project.id} className="bg-dark-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col lg:flex-row">
                    {/* Thumbnail / Preview Area */}
                    <div className="w-full lg:w-72 bg-black flex items-center justify-center relative min-h-[400px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-neutral-800 group">
                        {project.videoUrl ? (
                            <video 
                                src={project.videoUrl} 
                                controls 
                                playsInline
                                className="w-full h-full object-contain bg-black max-h-[500px]"
                                preload="metadata"
                            />
                        ) : project.thumbnailUrl ? (
                            <div className="relative w-full h-full">
                                <img 
                                    src={project.thumbnailUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover opacity-60" 
                                />
                                {project.status === 'production' ? (
                                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-neutral-300 gap-3">
                                        <Loader className="animate-spin text-gold-500" size={32} />
                                        <span className="text-xs font-bold tracking-widest uppercase">Rendering Video...</span>
                                     </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full border-2 border-neutral-700 flex items-center justify-center text-neutral-500">
                                            <MonitorPlay size={20} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-neutral-700 flex flex-col items-center justify-center p-8">
                                <MonitorPlay size={32} className="mb-3 opacity-50" />
                                <span className="text-xs mt-2 uppercase tracking-wide font-medium text-center">Concept<br/>Stage</span>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${
                                        project.status === 'ideation' ? 'border-blue-500/30 text-blue-500' :
                                        project.status === 'production' ? 'border-purple-500/30 text-purple-500' :
                                        project.status === 'review' ? 'border-green-500/30 text-green-500' :
                                        'border-neutral-700 text-neutral-500'
                                    }`}>
                                        {project.status}
                                    </span>
                                    <span className="text-xs text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded">{project.platform.join(', ')}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white leading-tight">{project.title}</h3>
                                {project.hook && <p className="text-sm text-neutral-400 mt-1 italic">Hook: "{project.hook}"</p>}
                            </div>
                        </div>

                        {project.script ? (
                            <div className="flex-1 min-h-[150px] bg-neutral-950 p-4 rounded-xl border border-neutral-800 mb-6 relative group/script">
                                <div className="absolute top-2 right-2 opacity-0 group-hover/script:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-neutral-500 bg-black px-2 py-1 rounded border border-neutral-800">Script Preview</span>
                                </div>
                                <p className="text-sm text-neutral-300 whitespace-pre-wrap font-mono leading-relaxed h-full overflow-y-auto custom-scrollbar">{project.script}</p>
                            </div>
                        ) : (
                            <div className="flex-1 min-h-[150px] flex items-center justify-center border border-dashed border-neutral-800 rounded-xl bg-neutral-950/30 mb-6">
                                <p className="text-sm text-neutral-600 italic">Script pending generation...</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-neutral-800">
                            {!project.script && (
                                <button 
                                    onClick={() => handleCreateScript(project)}
                                    disabled={loadingId === project.id}
                                    className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium border border-neutral-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {loadingId === project.id ? <Loader className="animate-spin" size={18}/> : <FileText size={18} />}
                                    Generate Script AI
                                </button>
                            )}
                            
                            {project.script && (project.status === 'production' || project.status === 'ideation' || project.status === 'scripting') && (
                                <button 
                                    onClick={() => handleGenerateVideo(project)}
                                    disabled={loadingId === project.id}
                                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
                                >
                                    {loadingId === project.id ? <Loader className="animate-spin" size={18}/> : <Video size={18} />}
                                    {project.status === 'production' ? 'Regenerate Video' : 'Generate Video (Veo)'}
                                </button>
                            )}

                             {project.status === 'review' && (
                                <>
                                    <button 
                                        onClick={() => openScheduleModal(project)}
                                        className="px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-black rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-gold-500/20"
                                    >
                                        <Calendar size={18} />
                                        Schedule & Publish
                                    </button>
                                    <button 
                                        onClick={() => handleGenerateVideo(project)} // Allow regen in review
                                        className="px-4 py-2.5 text-neutral-400 hover:text-white rounded-xl text-sm font-medium border border-transparent hover:border-neutral-700 transition-colors"
                                    >
                                        Regenerate
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Scheduling Modal */}
      {schedulingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-900 w-full max-w-md p-6 rounded-2xl border border-neutral-800 shadow-2xl relative">
                <button 
                    onClick={() => setSchedulingProject(null)}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-1">Schedule Publication</h3>
                <p className="text-sm text-neutral-400 mb-6">Choose when to auto-publish "{schedulingProject.title}"</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1">DATE</label>
                        <div className="relative">
                            <input 
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1">TIME</label>
                         <div className="relative">
                            <input 
                                type="time"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            onClick={() => setSchedulingProject(null)}
                            className="flex-1 py-3 text-neutral-400 hover:text-white font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmSchedule}
                            className="flex-1 py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-lg transition-colors shadow-lg shadow-gold-500/20 flex justify-center items-center gap-2"
                        >
                            <Clock size={16} />
                            Confirm Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

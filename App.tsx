import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { IdeationEngine } from './components/IdeationEngine';
import { ProductionHub } from './components/ProductionHub';
import { CalendarView } from './components/CalendarView';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { VideoProject, LogEntry, ConnectedAccounts, AccountConfig } from './types';
import { generateViralIdeas, generateScript } from './services/geminiService';
import { publishingService } from './services/publishingService';
import { generateVeoVideo } from './services/veoService';
import { db } from './services/supabaseClient';

// Fallback Initial Data (used if DB is empty or fails)
const fallbackProjects: VideoProject[] = [];
const fallbackLogs: LogEntry[] = [
    { id: '1', time: 'Just now', text: 'System connected. Waiting for automation trigger.', type: 'system' }
];

const defaultAccountConfig: AccountConfig = { connected: false };

const fallbackAccounts: ConnectedAccounts = {
    youtube: { ...defaultAccountConfig },
    tiktok: { ...defaultAccountConfig },
    instagram: { ...defaultAccountConfig },
    facebook: { ...defaultAccountConfig }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [projects, setProjects] = useState<VideoProject[]>(fallbackProjects);
  const [logs, setLogs] = useState<LogEntry[]>(fallbackLogs);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccounts>(fallbackAccounts);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  // Initialize Data from Supabase
  useEffect(() => {
    const initData = async () => {
      try {
        const [dbProjects, dbLogs, dbSettings] = await Promise.all([
          db.projects.getAll(),
          db.logs.getAll(),
          db.settings.get()
        ]);

        if (dbProjects && dbProjects.length > 0) setProjects(dbProjects);
        if (dbLogs && dbLogs.length > 0) setLogs(dbLogs);
        if (dbSettings) {
             // Merge with default to ensure structure validity if fields missing
             setConnectedAccounts({ ...fallbackAccounts, ...dbSettings });
        }
        
      } catch (e) {
        console.error("Initialization failed, using fallback data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check for API Key Selection (Required for Veo)
    const checkApiKey = async () => {
        if ((window as any).aistudio?.hasSelectedApiKey) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            // If running outside of the specific environment, assume key is present in env or not needed
            setApiKeySelected(true);
        }
    };

    initData();
    checkApiKey();
  }, []);

  // --- SCHEDULER: Checks every minute for due posts ---
  useEffect(() => {
      const checkSchedule = async () => {
          const now = new Date();
          const dueProjects = projects.filter(p => 
              p.status === 'scheduled' && 
              p.scheduledDate && 
              new Date(p.scheduledDate) <= now
          );

          if (dueProjects.length === 0) return;

          for (const project of dueProjects) {
              await addLog(`Time to publish: "${project.title}"`, 'system');
              
              // Attempt Publish
              try {
                  const platform = project.platform[0]; // Primary platform
                  const platformKey = platform === 'YouTube Shorts' ? 'youtube' : 
                                      platform === 'Instagram Reels' ? 'instagram' : 
                                      platform === 'TikTok' ? 'tiktok' : 'facebook';
                  
                  const account = connectedAccounts[platformKey as keyof ConnectedAccounts];

                  if (account.connected && account.accessToken && project.videoUrl) {
                      await addLog(`Uploading to ${platform}...`, 'publish');
                      
                      await publishingService.publish(
                          platform, 
                          project.videoUrl, 
                          project.title, 
                          project.script || "Viral Video", // Description/Caption
                          account
                      );

                      await updateProject(project.id, { status: 'published' });
                      await addLog(`Successfully published "${project.title}" to ${platform}!`, 'publish');
                  } else {
                      await addLog(`Failed to publish "${project.title}": Account not connected or Video missing.`, 'error');
                      await updateProject(project.id, { status: 'failed' }); // Prevent infinite retry loop
                  }

              } catch (error: any) {
                  console.error(error);
                  await addLog(`Publish Error: ${error.message}`, 'error');
                  await updateProject(project.id, { status: 'failed' });
              }
          }
      };

      const interval = setInterval(checkSchedule, 60000); // Check every minute
      return () => clearInterval(interval);
  }, [projects, connectedAccounts]);


  const addProject = async (project: VideoProject) => {
    setProjects(prev => [project, ...prev]);
    await db.projects.create(project);
  };

  const updateProject = async (id: string, updates: Partial<VideoProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await db.projects.update(id, updates);
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    await db.projects.delete(id);
    await addLog(`Project deleted from library.`, 'system');
  };

  const addLog = async (text: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
        id: Date.now().toString() + Math.random(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        text,
        type
    };
    setLogs(prev => [newLog, ...prev]);
    await db.logs.add(newLog);
  };

  const toggleAccount = async (platform: keyof ConnectedAccounts, config?: AccountConfig) => {
      // If config provided (save), use it. Else toggle connected (legacy/disconnect).
      const current = connectedAccounts[platform];
      
      const newConfig = config ? config : { ...current, connected: !current.connected };

      const newAccounts = {
          ...connectedAccounts,
          [platform]: newConfig
      };
      
      setConnectedAccounts(newAccounts);
      await db.settings.update(newAccounts);
      
      const action = newConfig.connected ? 'Connected' : 'Disconnected';
      addLog(`${action} ${platform} credentials updated.`, 'system');
  };

  const handleSelectKey = async () => {
      if ((window as any).aistudio?.openSelectKey) {
          try {
            await (window as any).aistudio.openSelectKey();
            // Race condition mitigation: assume success
            setApiKeySelected(true);
          } catch (e) {
            console.error("API Key selection failed", e);
            // Optionally reset if explicit error
          }
      }
  };

  const runAutomation = async () => {
      if (isAutomationRunning) return;
      
      const hasConnection = Object.values(connectedAccounts).some((acc: AccountConfig) => acc.connected);
      if (!hasConnection) {
          addLog('Failed to start automation: No accounts connected.', 'error');
          setCurrentView('settings');
          return;
      }

      setIsAutomationRunning(true);
      await addLog('Initiating daily viral content cycle...', 'system');

      try {
          // Phase 1: Ideation
          await addLog('Phase 1: Scanning market trends & generating concepts...', 'ai');
          
          const ideas = await generateViralIdeas("Millionaire Mindset", 1);
          if (!ideas || ideas.length === 0) throw new Error("Ideation failed");
          
          const bestIdea = ideas[0];
          await addLog(`Concept generated: "${bestIdea.title}" (Virality Score: ${bestIdea.viralityScore})`, 'ai');

          // Phase 2: Scripting
          await addLog('Phase 2: Generating platform-optimized script...', 'ai');
          const script = await generateScript(bestIdea.topic!, bestIdea.hook!, 'TikTok'); 
          
          const newProjectId = Date.now().toString();
          // Use YouTube as default for the automation cycle demo if available
          const defaultPlatform = connectedAccounts.youtube.connected ? 'YouTube Shorts' : 'TikTok';

          const newProject: VideoProject = {
              id: newProjectId,
              topic: bestIdea.topic || "General",
              title: bestIdea.title || "Untitled",
              hook: bestIdea.hook,
              script: script,
              platform: [defaultPlatform],
              status: 'production',
              generatedDate: new Date().toISOString(),
              viralityScore: bestIdea.viralityScore || 80
          };
          
          await addProject(newProject);
          await addLog('Script approved. Moving to Production Hub.', 'system');

          // Phase 3: Production (Veo)
          await addLog('Phase 3: AI Video Production & Rendering (Veo)...', 'system');
          
          // Use Veo Video Generation Service
          // Construct a visual prompt based on the hook and title
          const videoPrompt = `Cinematic vertical video, ${bestIdea.title}, ${bestIdea.hook}, high quality, 4k`;
          const videoUrl = await generateVeoVideo(videoPrompt);
          
          await updateProject(newProjectId, { 
              status: 'review', 
              thumbnailUrl: `https://picsum.photos/seed/${newProjectId}/400/700`,
              videoUrl: videoUrl
          });
          await addLog('Video rendered successfully. Scheduling for publication...', 'system');
          
          // Phase 4: Scheduling (Immediate for demo or +1 min)
          await new Promise(r => setTimeout(r, 1500));
          const scheduleTime = new Date(Date.now() + 10000).toISOString(); // 10 seconds from now
          
          await updateProject(newProjectId, { 
              status: 'scheduled',
              scheduledDate: scheduleTime
          });
          await addLog(`Success: "${bestIdea.title}" scheduled for auto-publish at ${new Date(scheduleTime).toLocaleTimeString()}.`, 'publish');

      } catch (error: any) {
          console.error(error);
          await addLog(`Automation cycle interrupted: ${error.message}`, 'error');
      } finally {
          setIsAutomationRunning(false);
      }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
            logs={logs} 
            runAutomation={runAutomation} 
            isRunning={isAutomationRunning} 
            accounts={connectedAccounts}
            setView={setCurrentView}
            projects={projects}
            onDeleteProject={deleteProject}
        />;
      case 'ideation':
        return <IdeationEngine onAddProject={addProject} />;
      case 'production':
        return <ProductionHub projects={projects} updateProject={updateProject} />;
      case 'calendar':
        return <CalendarView projects={projects} />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings accounts={connectedAccounts} toggleAccount={toggleAccount} />;
      default:
        return <div className="text-white">View Under Construction</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gold-500 font-bold tracking-wider animate-pulse">CONNECTING TO DATABASE...</p>
        </div>
      </div>
    );
  }

  // API Key Check Barrier
  if (!apiKeySelected) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center p-4">
          <div className="max-w-md w-full bg-dark-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl shadow-gold-900/10">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-500"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">API Key Required</h2>
              <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
                  To enable Veo video generation, you must select a Google Cloud API key with billing enabled.
              </p>
              <button 
                onClick={handleSelectKey}
                className="w-full py-3.5 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-xl transition-all shadow-lg shadow-gold-500/20"
              >
                  Select API Key
              </button>
              <p className="mt-6 text-[10px] text-neutral-600 uppercase tracking-widest">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:text-gold-500 transition-colors">
                      View Billing Documentation
                  </a>
              </p>
          </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black text-neutral-200 font-sans">
      <Sidebar currentView={currentView} setView={setCurrentView} accounts={connectedAccounts} />
      
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Global Background Gradient for "Luxury" feel */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neutral-800/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default App;
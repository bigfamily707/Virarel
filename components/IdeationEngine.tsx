import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { generateViralIdeas, analyzeTrend } from '../services/geminiService';
import { VideoProject } from '../types';

interface IdeationEngineProps {
  onAddProject: (project: VideoProject) => void;
}

export const IdeationEngine: React.FC<IdeationEngineProps> = ({ onAddProject }) => {
  const [niche, setNiche] = useState('Millionaire Mindset');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Partial<VideoProject>[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<string>('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTrendAnalysis("Analyzing market trends...");
    
    // Parallel execution for efficiency
    const [ideas, analysis] = await Promise.all([
        generateViralIdeas(niche),
        analyzeTrend(niche)
    ]);

    setGeneratedIdeas(ideas);
    setTrendAnalysis(analysis);
    setIsGenerating(false);
  };

  const approveIdea = (idea: Partial<VideoProject>) => {
    const newProject: VideoProject = {
      id: Date.now().toString(),
      topic: idea.topic || niche,
      title: idea.title || 'Untitled',
      hook: idea.hook || '',
      platform: ['TikTok', 'Instagram Reels'], // Default
      status: 'ideation',
      generatedDate: new Date().toISOString(),
      viralityScore: idea.viralityScore || 50,
    };
    onAddProject(newProject);
    // Remove from local list
    setGeneratedIdeas(prev => prev.filter(i => i.title !== idea.title));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Ideation Engine</h2>
            <p className="text-neutral-400">AI-powered trend research and concept generation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="bg-dark-900 p-6 rounded-2xl border border-neutral-800 h-fit">
            <h3 className="text-lg font-bold text-white mb-4">Configuration</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Target Niche</label>
                    <input 
                        type="text" 
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Content Pillar Focus</label>
                     <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500">
                        <option>Wealth Psychology</option>
                        <option>Passive Income</option>
                        <option>Success Stories</option>
                        <option>Financial Literacy</option>
                    </select>
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-black font-bold rounded-lg hover:from-gold-500 hover:to-gold-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isGenerating ? 'Analyzing & Generating...' : 'Generate Concepts'}
                </button>
            </div>

            {trendAnalysis && (
                <div className="mt-6 p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                    <h4 className="text-xs font-bold text-gold-500 mb-2 uppercase tracking-wider">Market Intelligence</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{trendAnalysis}</p>
                </div>
            )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
            {generatedIdeas.length === 0 && !isGenerating ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-2xl text-neutral-600">
                    <LightbulbPlaceholder />
                    <p className="mt-4">Ready to generate viral concepts</p>
                </div>
            ) : (
                generatedIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-dark-900 p-6 rounded-2xl border border-neutral-800 group hover:border-gold-500/30 transition-all flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded uppercase tracking-wider">
                                    Score: {idea.viralityScore}/100
                                </span>
                                <span className="text-xs text-neutral-500 uppercase">{idea.topic}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{idea.title}</h3>
                            <p className="text-sm text-neutral-400 mb-4"><span className="text-gold-500 font-medium">Hook:</span> "{idea.hook}"</p>
                        </div>
                        <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                            <button 
                                onClick={() => approveIdea(idea)}
                                className="px-4 py-2 bg-neutral-800 hover:bg-green-500/20 hover:text-green-500 hover:border-green-500/50 text-white border border-neutral-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Approve
                            </button>
                            <button className="px-4 py-2 bg-transparent hover:bg-neutral-800 text-neutral-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                <RefreshCw size={14} /> Regenerate
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

const LightbulbPlaceholder = () => (
    <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
        <Sparkles className="text-neutral-700" size={32} />
    </div>
)

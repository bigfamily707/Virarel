import React, { useState } from 'react';
import { Youtube, Facebook, Instagram, CheckCircle, Save, Key, User } from 'lucide-react';
import { ConnectedAccounts, AccountConfig } from '../types';

interface SettingsProps {
  accounts: ConnectedAccounts;
  toggleAccount: (platform: keyof ConnectedAccounts, config?: AccountConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ accounts, toggleAccount }) => {
  const [activeTab, setActiveTab] = useState<keyof ConnectedAccounts | null>(null);
  
  // Temporary state for form inputs
  const [tempToken, setTempToken] = useState('');
  const [tempId, setTempId] = useState('');

  const openConfig = (platform: keyof ConnectedAccounts) => {
      setActiveTab(platform);
      setTempToken(accounts[platform].accessToken || '');
      setTempId(accounts[platform].accountId || '');
  };

  const handleSave = (platform: keyof ConnectedAccounts) => {
      const newConfig: AccountConfig = {
          connected: true,
          accessToken: tempToken,
          accountId: tempId
      };
      toggleAccount(platform, newConfig);
      setActiveTab(null);
  };

  const handleDisconnect = (platform: keyof ConnectedAccounts) => {
      const newConfig: AccountConfig = {
          connected: false,
          accessToken: '',
          accountId: ''
      };
      toggleAccount(platform, newConfig);
      setActiveTab(null);
  };

  const platforms = [
    { id: 'youtube', name: 'YouTube Shorts', icon: <Youtube size={24} />, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'tiktok', name: 'TikTok', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'instagram', name: 'Instagram Reels', icon: <Instagram size={24} />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'facebook', name: 'Facebook Reels', icon: <Facebook size={24} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">System Configuration</h2>
        <p className="text-neutral-400">Manage Real API Credentials for Automation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Connections List */}
        <div className="bg-dark-900 p-8 rounded-2xl border border-neutral-800">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-gold-500 rounded-full"></span>
            Platform Integration
          </h3>
          
          <div className="space-y-4">
            {platforms.map((platform) => {
               const isConnected = accounts[platform.id as keyof ConnectedAccounts].connected;
               return (
              <div key={platform.id} className="flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${platform.bg} ${platform.color}`}>
                        {platform.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{platform.name}</h4>
                        <p className="text-xs text-neutral-500">
                        {isConnected ? 'Active & Ready' : 'Credentials Missing'}
                        </p>
                    </div>
                    </div>
                    
                    <button
                        onClick={() => openConfig(platform.id as keyof ConnectedAccounts)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            isConnected
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                        }`}
                    >
                        {isConnected ? (
                             <><CheckCircle size={16} /> Configured</>
                        ) : (
                             'Connect'
                        )}
                    </button>
                </div>

                {/* Configuration Form */}
                {activeTab === platform.id && (
                    <div className="p-4 bg-neutral-900/50 border-t border-neutral-800 space-y-4 animate-in slide-in-from-top-2">
                         <div>
                            <label className="text-xs font-bold text-neutral-400 mb-1 flex items-center gap-1">
                                <Key size={12} /> ACCESS TOKEN
                            </label>
                            <input 
                                type="password"
                                value={tempToken}
                                onChange={(e) => setTempToken(e.target.value)}
                                placeholder={`Paste your ${platform.name} OAuth Access Token`}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-sm text-white focus:border-gold-500 focus:outline-none"
                            />
                        </div>
                        {(platform.id === 'instagram' || platform.id === 'facebook') && (
                            <div>
                                <label className="text-xs font-bold text-neutral-400 mb-1 flex items-center gap-1">
                                    <User size={12} /> ACCOUNT ID (Page/User ID)
                                </label>
                                <input 
                                    type="text"
                                    value={tempId}
                                    onChange={(e) => setTempId(e.target.value)}
                                    placeholder={`e.g. 17841400...`}
                                    className="w-full bg-black border border-neutral-700 rounded p-2 text-sm text-white focus:border-gold-500 focus:outline-none"
                                />
                            </div>
                        )}
                        <div className="flex gap-2 justify-end pt-2">
                             {isConnected && (
                                <button 
                                    onClick={() => handleDisconnect(platform.id as keyof ConnectedAccounts)}
                                    className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-950 rounded border border-transparent hover:border-red-900"
                                >
                                    Disconnect
                                </button>
                             )}
                             <button 
                                onClick={() => setActiveTab(null)}
                                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                             >
                                Cancel
                             </button>
                             <button 
                                onClick={() => handleSave(platform.id as keyof ConnectedAccounts)}
                                className="px-3 py-1.5 bg-gold-600 hover:bg-gold-500 text-black text-xs font-bold rounded flex items-center gap-1"
                             >
                                <Save size={12} /> Save Credentials
                             </button>
                        </div>
                    </div>
                )}
              </div>
            )})}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div className="bg-dark-900 p-8 rounded-2xl border border-neutral-800">
             <h3 className="text-xl font-bold text-white mb-6">
              How to get Tokens?
            </h3>
            <div className="space-y-4 text-sm text-neutral-400">
                <p>
                    Since this is a client-side automation tool, you need to provide your own 
                    Access Tokens generated from the developer portals.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong className="text-white">YouTube:</strong> Go to <a href="#" className="text-gold-500 underline">Google Cloud Console</a>, create a project, enable YouTube Data API v3, and generate an OAuth token via OAuth Playground.
                    </li>
                    <li>
                        <strong className="text-white">Instagram/Facebook:</strong> Go to <a href="#" className="text-gold-500 underline">Meta for Developers</a>, create an App, add Instagram Graph API, and generate a User Token.
                    </li>
                </ul>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-xs mt-4">
                    <strong>Warning:</strong> These tokens are stored in your private Supabase database. Do not share your URL or API keys.
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSynapse } from '../context/SynapseContext';
import { LogOut, User, Shield, Database, Key, Eye, EyeOff, Check, Server, Wifi, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl, setBackendUrl } from '../utils/constants';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { addToast } = useSynapse();
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ── Backend URL Uplink State ──
  const [backendUrlInput, setBackendUrlInput] = useState(() => {
    return localStorage.getItem('synapse_backend_url') || '';
  });
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendTestStatus, setBackendTestStatus] = useState(null);
  const [isBackendSaved, setIsBackendSaved] = useState(false);

  const handleTestBackend = async () => {
    const urlToTest = (backendUrlInput.trim() || getBackendUrl()).replace(/\/+$/, '');
    setTestingBackend(true);
    setBackendTestStatus(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${urlToTest}/api/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setBackendTestStatus({ ok: true, message: `Connected! Server alive (${urlToTest})` });
        addToast('success', 'Backend Online', `Successfully connected to ${urlToTest}`);
      } else {
        setBackendTestStatus({ ok: false, message: `Server returned HTTP ${res.status}` });
        addToast('warning', 'Backend Warning', `Server reached but returned HTTP ${res.status}`);
      }
    } catch (err) {
      setBackendTestStatus({
        ok: false,
        message: err.name === 'AbortError' 
          ? 'Timeout after 8s. Render may be cold-starting (takes 30-50s) or URL is incorrect.'
          : `Connection failed: ${err.message}. Ensure URL is HTTPS and Render service is active.`
      });
      addToast('error', 'Connection Failed', 'Could not reach backend URL');
    } finally {
      setTestingBackend(false);
    }
  };

  const handleSaveBackendUrl = () => {
    const cleaned = backendUrlInput.trim().replace(/\/+$/, '');
    setBackendUrl(cleaned);
    setIsBackendSaved(true);
    addToast('success', 'Backend Saved', cleaned ? `Uplink set to: ${cleaned}` : 'Reset to default localhost/env');
    setTimeout(() => setIsBackendSaved(false), 2500);
  };

  const handleResetBackendUrl = () => {
    setBackendUrl('');
    setBackendUrlInput('');
    setBackendTestStatus(null);
    addToast('info', 'Backend Reset', 'Default local/environment backend restored');
  };

  const saveApiKey = () => {
    const trimmedKey = geminiApiKey.trim();
    if (!trimmedKey) {
      addToast('warning', 'API Key Required', 'Please paste a valid Google Gemini API key.');
      return;
    }
    localStorage.setItem('geminiApiKey', trimmedKey);
    setGeminiApiKey(trimmedKey);
    setIsSaved(true);
    addToast('success', 'API Saved Successfully', 'Your Google Gemini API key has been applied.');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your public profile and personal information.',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 flex items-center justify-center text-xl text-black dark:text-white">
              {user?.user_metadata?.full_name?.charAt(0) || 'U'}
            </div>
            <button className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
              Change Avatar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
              <input 
                type="text" 
                defaultValue={user?.user_metadata?.full_name || ''} 
                className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 text-black dark:text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg px-4 py-2 text-sm outline-none transition-colors" 
              />
            </div>
            <div className="text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Email Address</label>
              <input 
                type="email" 
                disabled 
                defaultValue={user?.email || ''} 
                className="w-full bg-black/10 dark:bg-black/40 border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 rounded-lg px-4 py-2 text-sm outline-none cursor-not-allowed font-mono" 
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Update your password and secure your account.',
      content: (
        <div className="space-y-4 text-left">
          <button className="px-4 py-2 bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-400/50 text-cyan-600 dark:text-cyan-200 backdrop-blur-md hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all text-sm font-semibold rounded-lg">
            Change Password
          </button>
          <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-black/20 rounded-xl border border-black/10 dark:border-white/5 mt-4">
            <div>
              <div className="text-sm text-black dark:text-white/90 font-semibold">Two-Factor Authentication</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</div>
            </div>
            <button 
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 border ${twoFactorEnabled ? 'bg-cyan-500/40 border-cyan-400' : 'bg-black/10 dark:bg-black/40 border-black/20 dark:border-white/10'}`}
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300 shadow-sm ${twoFactorEnabled ? 'bg-cyan-500 dark:bg-cyan-300 left-[22px]' : 'bg-slate-400 dark:bg-slate-500 left-1'}`} />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'backend-uplink',
      title: 'Cloud Backend Uplink (Live Swarm & AI Engine)',
      icon: Server,
      description: 'Connect this device to your deployed backend (e.g. Render) so live agents and real-time sockets work everywhere.',
      content: (
        <div className="space-y-4 text-left">
          <div className="text-left">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Backend Server URL (Express + Socket.IO)
              </label>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                Active: {getBackendUrl()}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={backendUrlInput}
                  onChange={(e) => setBackendUrlInput(e.target.value)}
                  placeholder="e.g. https://synapse-os-backend.onrender.com" 
                  className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 text-black dark:text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg px-4 py-2 text-sm outline-none transition-colors font-mono" 
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleTestBackend}
                  disabled={testingBackend}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 border border-black/10 dark:border-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Test connection to /api/health"
                >
                  <RefreshCw size={13} className={testingBackend ? 'animate-spin' : ''} />
                  {testingBackend ? 'Pinging...' : 'Test'}
                </button>

                <button 
                  onClick={handleSaveBackendUrl}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-1.5 ${
                    isBackendSaved 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50' 
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/20'
                  }`}
                >
                  {isBackendSaved ? (
                    <>
                      <Check size={16} /> Saved!
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>

            {backendTestStatus && (
              <div className={`mt-2 p-2.5 rounded-lg text-xs border font-mono flex items-center gap-2 ${
                backendTestStatus.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              }`}>
                {backendTestStatus.ok ? <Wifi size={14} className="shrink-0" /> : <Shield size={14} className="shrink-0" />}
                <span>{backendTestStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-slate-500">
                Saved in browser storage so any new phone, tablet, or laptop can connect to your cloud server.
              </p>
              {backendUrlInput && (
                <button
                  type="button"
                  onClick={handleResetBackendUrl}
                  className="text-[10px] text-slate-400 hover:text-red-500 underline"
                >
                  Reset to default
                </button>
              )}
            </div>

            <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              <div className="font-semibold text-cyan-600 dark:text-cyan-400">⚡ Multi-Device & Mobile Setup:</div>
              <div>
                • When opening from a new phone or tablet, paste your <strong>Render Web Service URL</strong> above (e.g. <code>https://synapse-os-backend.onrender.com</code>).
              </div>
              <div>
                • Free-tier Render instances sleep when idle and take ~40 seconds to wake up on initial load. Synapse automatically runs an <strong>autonomous in-browser simulation</strong> while connecting so your UI is never broken!
              </div>
              <div>
                • To configure globally for all visitors, set the environment variable <code>VITE_BACKEND_URL</code> in your Vercel Project Settings.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-config',
      title: 'API Configuration',
      icon: Key,
      description: 'Configure your external API keys for AI services.',
      content: (
        <div className="space-y-4 text-left">
          <div className="text-left">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Google Gemini API Key</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input 
                  type={showApiKey ? "text" : "password"} 
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key (AIzaSy...)" 
                  className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 text-black dark:text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg px-4 py-2 pr-10 text-sm outline-none transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button 
                onClick={saveApiKey}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-1.5 ${
                  isSaved 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50' 
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/20'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check size={16} /> Saved!
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Your key is stored securely in your browser's local storage.
            </p>
            
            <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              <div className="font-semibold text-cyan-600 dark:text-cyan-400">💡 Google Gemini API Key Guidelines:</div>
              <div>
                • For free, unrestricted keys, generate directly from{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-cyan-500 underline font-medium hover:text-cyan-400"
                >
                  Google AI Studio (aistudio.google.com)
                </a>.
              </div>
              <div>
                • If using Google Cloud Console, ensure the <strong>Generative Language API</strong> is enabled and not restricted.
              </div>
              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                • Alternatively, you can use the built-in <strong>Simulator Mode</strong> in Neural Core to test workflows without an API key!
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'danger',
      title: 'Danger Zone',
      icon: Database,
      description: 'Irreversible actions for your account and data.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div>
              <div className="text-sm text-red-400 font-semibold">Delete Account</div>
              <div className="text-[11px] text-red-400/70">Permanently delete your account and all data.</div>
            </div>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full w-full bg-transparent flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="h-auto min-h-20 py-4 px-4 sm:px-8 flex items-center justify-between border-b border-black/10 dark:border-white/10 shrink-0 bg-white/40 dark:bg-white/5 backdrop-blur-2xl sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="text-left">
          <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white/90">Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        {sections.map(section => (
          <div key={section.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-black/10 dark:border-white/10">
                <section.icon size={16} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-black dark:text-white/90 text-left">{section.title}</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 pl-0 sm:pl-11 text-left">{section.description}</p>
            <div className="pl-0 sm:pl-11">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;

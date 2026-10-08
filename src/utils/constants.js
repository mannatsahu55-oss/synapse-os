export const APP_NAME = "Synapse Observatory";
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.synapse.io' 
  : 'http://localhost:3000';

// Backend server URL (Express + Socket.IO) — used for AI orchestration & Live Swarm
// Prioritizes: 
// 1. User-configured backend URL stored in localStorage ('synapse_backend_url')
// 2. VITE_BACKEND_URL build-time environment variable
// 3. 'http://localhost:4000' for local development
export const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('synapse_backend_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:4000';
};

export const setBackendUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('synapse_backend_url', url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('synapse_backend_url');
    }
    window.dispatchEvent(new CustomEvent('synapse_backend_url_change', { detail: url }));
  }
};

export const BACKEND_URL = getBackendUrl();



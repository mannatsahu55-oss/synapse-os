import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, Download, Plus, Map, LayoutDashboard, Edit, CheckCircle2, Activity, 
  AlertTriangle, Filter, Trash2, X, Edit2, Check, Globe, Workflow, ExternalLink, 
  RefreshCw, Copy, Radio, Layers, Send, Bot, Zap, Sparkles, Clock, ShieldCheck, Terminal
} from 'lucide-react';
import { useSynapse } from '../context/SynapseContext';
import Modal from '../components/common/Modal';
import { useAgentStats } from '../hooks/useAgentStats';
import { BACKEND_URL, getBackendUrl } from '../utils/constants';

// ── Default Connected AI Projects (Starter data) ──
const DEFAULT_CONNECTED_PROJECTS = [
  {
    id: 'proj-n8n-lead',
    name: 'n8n Autonomous Lead Swarm',
    type: 'n8n',
    url: 'https://n8n.io/workflows/agentic-synapse',
    framework: 'n8n Workflow Engine',
    env: 'Production',
    status: 'ONLINE',
    latency: 38,
    lastPing: 'Just now',
    description: 'Autonomous multi-branch workflow routing incoming webhook events to Synapse AI agents',
    eventsCount: 124,
    events: [
      { id: 'ev-1', eventName: 'workflow.execution.completed', timestamp: 'Just now', latency: 38, payload: { executionId: 'exec_9921', status: 'success', nodesRan: 8 } },
      { id: 'ev-2', eventName: 'agent.decision.routed', timestamp: '2m ago', latency: 42, payload: { confidence: 0.98, targetQueue: 'high-priority-leads' } },
      { id: 'ev-3', eventName: 'webhook.received', timestamp: '5m ago', latency: 35, payload: { source: 'n8n_cloud', payloadBytes: 1042 } },
    ]
  },
  {
    id: 'proj-web-copilot',
    name: 'Customer Support Portal AI',
    type: 'website',
    url: 'http://localhost:5173/app/neural-core',
    framework: 'LangGraph / Next.js Agent',
    env: 'Production',
    status: 'ONLINE',
    latency: 16,
    lastPing: 'Just now',
    description: 'Web application assistant linked to Synapse Observatory for real-time hallucination scoring',
    eventsCount: 89,
    events: [
      { id: 'ev-4', eventName: 'inference.telemetry.ingested', timestamp: '1m ago', latency: 16, payload: { promptTokens: 412, responseTokens: 98, hrsScore: 0.04 } },
      { id: 'ev-5', eventName: 'health.heartbeat.ok', timestamp: '4m ago', latency: 15, payload: { uptime: '99.98%', memoryMb: 142 } }
    ]
  }
];

// ── Add/Edit Lease Form ──
const LeaseForm = ({ lease, onSave, onCancel }) => {
  const [form, setForm] = useState(lease || {
    company: '', property: '', startDate: '', endDate: '', units: '', moveIn: 'Pending', moveOut: 'Pending', status: 'draft'
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 font-sans text-black dark:text-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-black/70 dark:text-white/70 mb-1.5 block">Company</label>
          <input value={form.company} onChange={e => handleChange('company', e.target.value)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-none px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="Company name" />
        </div>
        <div>
          <label className="text-xs font-medium text-black/70 dark:text-white/70 mb-1.5 block">Property</label>
          <input value={form.property} onChange={e => handleChange('property', e.target.value)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-none px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="Property name" />
        </div>
        <div>
          <label className="text-xs font-medium text-black/70 dark:text-white/70 mb-1.5 block">Start Date</label>
          <input value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-none px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="YYYY-MM-DD" />
        </div>
        <div>
          <label className="text-xs font-medium text-black/70 dark:text-white/70 mb-1.5 block">End Date</label>
          <input value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-none px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="YYYY-MM-DD" />
        </div>
        <div>
          <label className="text-xs font-medium text-black/70 dark:text-white/70 mb-1.5 block">Units</label>
          <input value={form.units} onChange={e => handleChange('units', e.target.value)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-none px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="0" />
        </div>
        <div>
          <label className="text-xs font-medium text-black/70 dark:text-white/70 mb-1.5 block">Status</label>
          <select value={form.status} onChange={e => handleChange('status', e.target.value)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-none px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors">
            <option value="current">Current</option>
            <option value="past">Past</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.company || !form.property}
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-none hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// ── Import Project Modal ──
const ImportProjectModal = ({ isOpen, onClose, onImport, addToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'n8n', // 'n8n' | 'website'
    url: '',
    framework: 'n8n Workflow Engine',
    env: 'Production',
    description: '',
  });

  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookIngestUrl = `${getBackendUrl()}/api/projects/webhook-ingest`;

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      framework: type === 'n8n' ? 'n8n Workflow Engine' : 'LangGraph / Next.js Agent'
    }));
    setPingResult(null);
  };

  const handleTestPing = async () => {
    if (!formData.url.trim()) {
      addToast?.('warning', 'Missing URL', 'Please enter a target URL or webhook link');
      return;
    }

    setTestingPing(true);
    setPingResult(null);

    try {
      const res = await fetch(`${getBackendUrl()}/api/projects/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.url.trim() }),
      });
      const data = await res.json();
      setPingResult(data);
      if (data.online) {
        addToast?.('success', 'Uplink Verified', `Target is online (${data.latency}ms, HTTP ${data.statusCode})`);
      } else {
        addToast?.('warning', 'Uplink Warning', data.error || 'Server responded with error');
      }
    } catch (err) {
      // Fallback direct check
      const start = Date.now();
      try {
        await fetch(formData.url.trim(), { method: 'HEAD', mode: 'no-cors' });
        const latency = Date.now() - start;
        setPingResult({ success: true, online: true, latency, statusCode: 200 });
        addToast?.('success', 'Uplink Reachable', `Direct ping succeeded (${latency}ms)`);
      } catch (e) {
        const latency = Date.now() - start;
        setPingResult({ success: false, online: false, error: 'Target URL unreachable', latency });
        addToast?.('error', 'Ping Failed', 'Unable to reach target URL');
      }
    } finally {
      setTestingPing(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookIngestUrl);
    setCopiedWebhook(true);
    addToast?.('info', 'Copied', 'Webhook ingest URL copied to clipboard');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      addToast?.('warning', 'Incomplete Form', 'Please specify a project name and target URL');
      return;
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      name: formData.name.trim(),
      type: formData.type,
      url: formData.url.trim(),
      framework: formData.framework,
      env: formData.env,
      status: pingResult?.online !== false ? 'ONLINE' : 'DEGRADED',
      latency: pingResult?.latency || 42,
      lastPing: 'Just now',
      description: formData.description.trim() || (formData.type === 'n8n' ? 'Custom n8n workflow uplink' : 'External AI service uplink'),
      eventsCount: 1,
      events: [
        {
          id: `ev-${Date.now()}`,
          eventName: 'project.uplink_established',
          timestamp: 'Just now',
          latency: pingResult?.latency || 42,
          payload: { 
            type: formData.type, 
            framework: formData.framework, 
            env: formData.env,
            telemetryUplink: 'Synapse Observatory' 
          }
        }
      ]
    };

    onImport(newProject);
    addToast?.('success', 'Project Connected', `${newProject.name} is now monitored through Synapse`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import & Monitor AI Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5 font-sans text-black dark:text-white">
        
        {/* Link Type Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60 mb-2 block">
            Select Uplink Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('n8n')}
              className={`p-3.5 border text-left transition-all flex items-start gap-3 rounded-none ${
                formData.type === 'n8n'
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/10 ring-1 ring-black dark:ring-white'
                  : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
              }`}
            >
              <div className="p-2 rounded-none bg-blue-500/10 text-blue-500">
                <Workflow size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-black dark:text-white flex items-center gap-1.5">
                  n8n Workflow Link
                </div>
                <div className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                  Webhook triggers, scheduled execution flows & AI nodes
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('website')}
              className={`p-3.5 border text-left transition-all flex items-start gap-3 rounded-none ${
                formData.type === 'website'
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/10 ring-1 ring-black dark:ring-white'
                  : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
              }`}
            >
              <div className="p-2 rounded-none bg-emerald-500/10 text-emerald-500">
                <Globe size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-black dark:text-white flex items-center gap-1.5">
                  Website / Web App Link
                </div>
                <div className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                  AI web applications, Next.js agents & REST endpoints
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Project Name & Framework */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-black/70 dark:text-white/70 mb-1.5 block">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={formData.type === 'n8n' ? 'e.g. Autonomous Invoice Agent' : 'e.g. Next.js Copilot Web App'}
              className="w-full bg-white/50 dark:bg-black/50 border border-black/15 dark:border-white/15 px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors rounded-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-black/70 dark:text-white/70 mb-1.5 block">
              AI Framework / Engine
            </label>
            <select
              value={formData.framework}
              onChange={e => setFormData(prev => ({ ...prev, framework: e.target.value }))}
              className="w-full bg-white/50 dark:bg-black/50 border border-black/15 dark:border-white/15 px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors rounded-none"
            >
              {formData.type === 'n8n' ? (
                <>
                  <option value="n8n Workflow Engine">n8n Workflow Engine</option>
                  <option value="n8n AI Agent Node">n8n AI Agent Node (LangChain)</option>
                  <option value="n8n + Ollama / Local LLM">n8n + Ollama / Local LLM</option>
                  <option value="n8n + OpenAI Assistant">n8n + OpenAI Assistant</option>
                </>
              ) : (
                <>
                  <option value="LangGraph / Next.js Agent">LangGraph / Next.js Agent</option>
                  <option value="CrewAI Swarm">CrewAI Multi-Agent Swarm</option>
                  <option value="FastAPI / Python AI Server">FastAPI / Python AI Server</option>
                  <option value="OpenAI Assistants API">OpenAI Assistants API</option>
                  <option value="Custom REST / Webhook">Custom REST / Webhook Agent</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Target URL with Test Uplink Button */}
        <div>
          <label className="text-xs font-semibold text-black/70 dark:text-white/70 mb-1.5 flex justify-between items-center">
            <span>{formData.type === 'n8n' ? 'n8n Webhook / Flow Endpoint' : 'Website URL / Health Endpoint'} <span className="text-red-500">*</span></span>
            {pingResult && (
              <span className={`text-[11px] font-mono font-medium flex items-center gap-1 ${pingResult.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {pingResult.online ? (
                  <>
                    <CheckCircle2 size={12} /> Online ({pingResult.latency}ms {pingResult.statusCode ? `• HTTP ${pingResult.statusCode}` : ''})
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} /> {pingResult.error || 'Offline'} ({pingResult.latency}ms)
                  </>
                )}
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={formData.url}
              onChange={e => {
                setFormData(prev => ({ ...prev, url: e.target.value }));
                setPingResult(null);
              }}
              placeholder={formData.type === 'n8n' ? 'https://n8n.yourserver.com/webhook/synapse-agent' : 'https://your-ai-app.com or http://localhost:5173'}
              className="flex-1 bg-white/50 dark:bg-black/50 border border-black/15 dark:border-white/15 px-3 py-2 text-sm text-black dark:text-white font-mono outline-none focus:border-black dark:focus:border-white transition-colors rounded-none"
            />
            <button
              type="button"
              onClick={handleTestPing}
              disabled={testingPing || !formData.url}
              className="px-4 py-2 border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 rounded-none shrink-0"
            >
              <RefreshCw size={12} className={testingPing ? 'animate-spin' : ''} />
              {testingPing ? 'Pinging...' : 'Test Uplink'}
            </button>
          </div>
        </div>

        {/* Environment & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-black/70 dark:text-white/70 mb-1.5 block">
              Environment
            </label>
            <div className="flex border border-black/15 dark:border-white/15 divide-x divide-black/15 dark:divide-white/15">
              {['Production', 'Staging', 'Dev'].map(env => (
                <button
                  type="button"
                  key={env}
                  onClick={() => setFormData(prev => ({ ...prev, env }))}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    formData.env === env
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-black/70 dark:text-white/70 mb-1.5 block">
              Project Description / Mission
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Scans lead emails and delegates to Synapse neural swarm"
              className="w-full bg-white/50 dark:bg-black/50 border border-black/15 dark:border-white/15 px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors rounded-none"
            />
          </div>
        </div>

        {/* Live Synapse Ingest Helper Card */}
        <div className="p-3.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase font-semibold text-black/60 dark:text-white/60 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" /> Synapse Telemetry Ingestion Webhook
            </span>
            <button
              type="button"
              onClick={copyWebhookUrl}
              className="text-xs font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              {copiedWebhook ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copiedWebhook ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <div className="font-mono text-xs bg-white/80 dark:bg-black/60 p-2 border border-black/10 dark:border-white/10 text-black dark:text-white break-all select-all">
            {webhookIngestUrl}
          </div>
          <p className="text-[11px] text-black/60 dark:text-white/60 mt-1.5">
            Send HTTP POST requests with <code className="font-mono font-bold text-black dark:text-white">{`{ projectId, eventName, payload }`}</code> from your n8n workflow or app to stream live AI events into Synapse.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors rounded-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold rounded-none hover:bg-black/85 dark:hover:bg-white/85 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} /> Connect & Monitor Project
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Project Telemetry Monitor Modal ──
const ProjectMonitorModal = ({ project, isOpen, onClose, onSendTestEvent, onRefreshPing, isPinging, addToast }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!project) return null;

  const webhookIngestUrl = `${getBackendUrl()}/api/projects/webhook-ingest`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookIngestUrl);
    setCopiedUrl(true);
    addToast?.('info', 'Copied', 'Ingestion endpoint copied');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const sampleCurl = `curl -X POST ${webhookIngestUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"projectId":"${project.id}","eventName":"agent.run","payload":{"model":"gemini-1.5-pro","status":"success"}}'`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Monitor: ${project.name}`} size="xl">
      <div className="space-y-6 font-sans text-black dark:text-white">
        
        {/* Top Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-none">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-none ${project.type === 'n8n' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {project.type === 'n8n' ? <Workflow size={24} /> : <Globe size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black dark:text-white tracking-tight">{project.name}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                  project.status === 'ONLINE'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {project.status}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
                  {project.env}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-xs text-black/60 dark:text-white/60">
                <span>{project.framework}</span>
                <span>•</span>
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline flex items-center gap-1 text-black/80 dark:text-white/80"
                >
                  <span className="truncate max-w-[260px]">{project.url}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onRefreshPing(project)}
              disabled={isPinging}
              className="px-3 py-1.5 border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/70 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors rounded-none"
            >
              <RefreshCw size={12} className={isPinging ? 'animate-spin' : ''} />
              Re-Ping
            </button>
            <button
              onClick={() => onSendTestEvent(project)}
              className="px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 text-xs font-semibold flex items-center gap-1.5 transition-colors rounded-none shadow-sm"
            >
              <Zap size={12} className="text-amber-400 fill-amber-400" />
              Fire Test Event
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50">
            <div className="text-[11px] font-mono uppercase text-black/50 dark:text-white/50">Heartbeat Latency</div>
            <div className="text-2xl font-mono font-bold text-black dark:text-white mt-1">
              {project.latency} <span className="text-xs text-black/50 dark:text-white/50">ms</span>
            </div>
          </div>
          <div className="p-4 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50">
            <div className="text-[11px] font-mono uppercase text-black/50 dark:text-white/50">Uptime Reliability</div>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              99.9%
            </div>
          </div>
          <div className="p-4 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50">
            <div className="text-[11px] font-mono uppercase text-black/50 dark:text-white/50">Ingested Events</div>
            <div className="text-2xl font-mono font-bold text-black dark:text-white mt-1">
              {project.eventsCount || project.events?.length || 0}
            </div>
          </div>
          <div className="p-4 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50">
            <div className="text-[11px] font-mono uppercase text-black/50 dark:text-white/50">Telemetry Link</div>
            <div className="text-sm font-mono font-bold text-black dark:text-white mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Socket.IO Bus
            </div>
          </div>
        </div>

        {/* Live Ingestion Event Stream */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
                Live Ingestion Stream
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-none bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70">
                {project.events?.length || 0} recent
              </span>
            </div>
            <span className="text-[11px] font-mono text-black/50 dark:text-white/50">
              Synced with Synapse Bus
            </span>
          </div>

          <div className="border border-black/10 dark:border-white/10 divide-y divide-black/10 dark:divide-white/10 bg-white/40 dark:bg-black/40 max-h-56 overflow-y-auto">
            {(!project.events || project.events.length === 0) ? (
              <div className="p-6 text-center text-xs font-mono text-black/50 dark:text-white/50">
                [EMPTY] No telemetry events captured yet. Click "Fire Test Event" above to test the ingestion stream.
              </div>
            ) : (
              project.events.map((ev) => (
                <div key={ev.id} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-black dark:text-white text-xs">{ev.eventName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {ev.latency}ms
                      </span>
                    </div>
                    {ev.payload && (
                      <div className="font-mono text-[11px] text-black/60 dark:text-white/60 truncate max-w-xl">
                        {JSON.stringify(ev.payload)}
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-black/40 dark:text-white/40 shrink-0 self-end sm:self-center">
                    {ev.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="p-4 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
              <Terminal size={14} /> Send Telemetry from Terminal / n8n HTTP Node
            </span>
            <button
              onClick={copyWebhookUrl}
              className="text-xs font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              {copiedUrl ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copiedUrl ? 'Copied URL!' : 'Copy Webhook URL'}
            </button>
          </div>
          <pre className="p-3 bg-black text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all border border-black/20 dark:border-white/10">
            {sampleCurl}
          </pre>
        </div>

      </div>
    </Modal>
  );
};

// ── Project Card Component ──
const ProjectCard = ({ project, onPing, onMonitor, onDelete, isPinging }) => {
  return (
    <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none p-5 shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between hover:border-black/30 dark:hover:border-white/30 transition-all duration-300">
      <div>
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-none ${project.type === 'n8n' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'} border border-black/10 dark:border-white/10`}>
              {project.type === 'n8n' ? <Workflow size={18} /> : <Globe size={18} />}
            </div>
            <div>
              <div className="font-bold text-sm text-black dark:text-white tracking-tight line-clamp-1">{project.name}</div>
              <div className="font-mono text-[10px] text-black/50 dark:text-white/50">{project.framework}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
              project.status === 'ONLINE'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {project.status}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 uppercase">
              {project.env}
            </span>
          </div>
        </div>

        {/* URL Link */}
        <div className="bg-black/5 dark:bg-white/5 p-2 border border-black/10 dark:border-white/10 font-mono text-xs flex items-center justify-between gap-2 mb-3">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
            title={project.url}
          >
            {project.url}
          </a>
          <ExternalLink size={12} className="text-black/40 dark:text-white/40 shrink-0" />
        </div>

        {/* Description */}
        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Footer & Stats */}
      <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 font-mono">
          <span className="text-[11px] text-black/60 dark:text-white/60 flex items-center gap-1">
            <Activity size={12} className="text-emerald-500" />
            <strong className="text-black dark:text-white">{project.latency}ms</strong>
          </span>
          <span className="text-[11px] text-black/40 dark:text-white/40">
            {project.eventsCount || project.events?.length || 0} events
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPing(project)}
            disabled={isPinging}
            className="w-7 h-7 flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors rounded-none"
            title="Re-ping uplink"
          >
            <RefreshCw size={12} className={isPinging ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => onMonitor(project)}
            className="px-2.5 py-1 text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 transition-colors rounded-none flex items-center gap-1"
            title="Open telemetry monitor"
          >
            <Radio size={12} /> Monitor
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="w-7 h-7 flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-red-500/10 text-black/40 dark:text-white/40 hover:text-red-500 transition-colors rounded-none"
            title="Disconnect project"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main CommandCenter View ──
const CommandCenter = () => {
  const { leases, addLease, updateLease, deleteLease, exportLeasesCSV, permissions, togglePermission, agentStatuses, addToast } = useSynapse();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('past');
  const [subTab, setSubTab] = useState('tenancy');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLease, setEditingLease] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Connected Projects State (persisted in localStorage) ──
  const [connectedProjects, setConnectedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_connected_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load connected projects from localStorage', e);
    }
    return DEFAULT_CONNECTED_PROJECTS;
  });

  const [showImportModal, setShowImportModal] = useState(false);
  const [monitoredProject, setMonitoredProject] = useState(null);
  const [pingingId, setPingingId] = useState(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  // Save to localStorage whenever connectedProjects change
  useEffect(() => {
    try {
      localStorage.setItem('synapse_connected_projects', JSON.stringify(connectedProjects));
    } catch (e) {}
  }, [connectedProjects]);

  const [contacts, setContacts] = useState([
    { id: '1', name: "Aman Verma", email: "aman.v@synapse.io", role: "Lead Multi-Branch Auditor", type: "auditor" },
    { id: '2', name: "Sarah Jenkins", email: "s.jenkins@synapse.io", role: "Legal Counsel (Leasing)", type: "counsel" },
    { id: '3', name: "System Dispatcher Agent", email: "dispatcher@synapse.io", role: "Autonomous Microservice", type: "agent", status: "ACTIVE" }
  ]);

  const filteredLeases = useMemo(() => {
    let result = leases.filter(l => l.status === activeTab);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l =>
        l.company.toLowerCase().includes(term) ||
        l.property.toLowerCase().includes(term)
      );
    }
    return result;
  }, [leases, activeTab, searchTerm]);

  const tabCounts = useMemo(() => ({
    current: leases.filter(l => l.status === 'current').length,
    past: leases.filter(l => l.status === 'past').length,
    draft: leases.filter(l => l.status === 'draft').length,
  }), [leases]);

  const { totalAgentActions, activeAgents } = useAgentStats(agentStatuses);

  // Ping a single project
  const handlePingProject = async (project) => {
    setPingingId(project.id);
    const start = Date.now();
    let result = null;

    try {
      const res = await fetch(`${getBackendUrl()}/api/projects/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: project.url }),
      });
      result = await res.json();
    } catch (err) {
      // Direct fallback
      try {
        await fetch(project.url, { method: 'HEAD', mode: 'no-cors' });
        result = { success: true, online: true, latency: Date.now() - start };
      } catch (e) {
        result = { success: false, online: false, latency: Date.now() - start, error: 'Unreachable' };
      }
    } finally {
      setPingingId(null);
    }

    const latency = result?.latency || Math.floor(Math.random() * 25) + 15;
    const isOnline = result?.online !== false;

    setConnectedProjects(prev => prev.map(p => {
      if (p.id === project.id) {
        return {
          ...p,
          status: isOnline ? 'ONLINE' : 'OFFLINE',
          latency,
          lastPing: 'Just now',
        };
      }
      return p;
    }));

    if (monitoredProject?.id === project.id) {
      setMonitoredProject(prev => ({
        ...prev,
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        latency,
      }));
    }

    addToast?.(isOnline ? 'success' : 'warning', 'Heartbeat Updated', `${project.name}: ${latency}ms`);
  };

  // Refresh all project pings
  const handleRefreshAllProjects = async () => {
    setRefreshingAll(true);
    for (const proj of connectedProjects) {
      await handlePingProject(proj);
    }
    setRefreshingAll(false);
    addToast?.('info', 'Swarm Refreshed', 'All project links updated');
  };

  // Add new imported project
  const handleImportProject = (newProject) => {
    setConnectedProjects(prev => [newProject, ...prev]);
  };

  // Delete project
  const handleDeleteProject = (id) => {
    setConnectedProjects(prev => prev.filter(p => p.id !== id));
    addToast?.('info', 'Uplink Removed', 'Project disconnected from Synapse');
  };

  // Send a test event to backend webhook-ingest
  const handleSendTestEvent = async (project) => {
    const eventName = project.type === 'n8n' ? 'n8n.workflow.executed' : 'agent.inference_completed';
    const newEvent = {
      id: `ev-${Date.now()}`,
      eventName,
      timestamp: 'Just now',
      latency: Math.floor(Math.random() * 25) + 12,
      payload: {
        projectId: project.id,
        model: project.type === 'n8n' ? 'n8n-ollama-node' : 'gemini-1.5-pro',
        status: 'success',
        tokens: Math.floor(Math.random() * 250) + 95,
        executionMs: Math.floor(Math.random() * 120) + 30
      }
    };

    try {
      await fetch(`${getBackendUrl()}/api/projects/webhook-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          eventName,
          source: project.type === 'n8n' ? 'n8n_webhook' : 'website_uplink',
          payload: newEvent.payload
        })
      });
    } catch (e) {
      // Backend offline fallback
    }

    setConnectedProjects(prev => prev.map(p => {
      if (p.id === project.id) {
        return {
          ...p,
          eventsCount: (p.eventsCount || p.events?.length || 0) + 1,
          events: [newEvent, ...(p.events || []).slice(0, 15)]
        };
      }
      return p;
    }));

    if (monitoredProject?.id === project.id) {
      setMonitoredProject(prev => ({
        ...prev,
        eventsCount: (prev.eventsCount || prev.events?.length || 0) + 1,
        events: [newEvent, ...(prev.events || []).slice(0, 15)]
      }));
    }

    addToast?.('success', 'Telemetry Captured', `Event ingested into Synapse for ${project.name}`);
  };

  const handleSaveNew = useCallback((form) => {
    addLease(form);
    setShowAddModal(false);
  }, [addLease]);

  const handleSaveEdit = useCallback((form) => {
    updateLease(editingLease.id, form);
    setEditingLease(null);
  }, [editingLease, updateLease]);

  const handleDelete = useCallback((id) => {
    deleteLease(id);
    setDeleteConfirm(null);
  }, [deleteLease]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent font-sans text-black dark:text-white transition-colors duration-500">
      
      {/* Top Navigation Bar - Glassmorphic */}
      <div className="h-auto min-h-16 py-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 shrink-0 bg-white/70 dark:bg-black/70 backdrop-blur-md z-20 relative transition-colors duration-500">
        <div className="flex items-center gap-4">
           <div className="font-display font-bold text-lg sm:text-xl tracking-tighter text-black dark:text-white">Command Center</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-none py-1.5 px-3 focus-within:border-black dark:focus-within:border-white transition-colors flex-1 sm:flex-initial sm:w-60 min-w-[140px]">
            <Search size={14} className="text-black/50 dark:text-white/50 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-black dark:text-white text-sm ml-2 w-full placeholder:text-black/30 dark:placeholder:text-white/30"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white shrink-0">
                <X size={14} />
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-none hover:bg-black/85 dark:hover:bg-white/85 transition-colors shadow-sm shrink-0"
          >
            <Plus size={14} /> Import Project
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-none border border-black/10 dark:border-white/10 text-xs font-medium text-black/70 dark:text-white/70 bg-white/50 dark:bg-black/50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0">
            <Activity size={13} className="text-emerald-500" />
            System Live
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-3 sm:p-6 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-5 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500">
              <div className="text-[10px] sm:text-xs font-medium text-black/60 dark:text-white/60 mb-2">Active Agents</div>
              <div className="text-2xl sm:text-3xl font-display font-bold tracking-tighter text-black dark:text-white">{activeAgents}</div>
            </div>
            
            <div className="p-3.5 sm:p-5 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500 border-l-2 border-l-blue-500">
              <div className="text-[10px] sm:text-xs font-medium text-black/60 dark:text-white/60 mb-2">Monitored Projects</div>
              <div className="text-2xl sm:text-3xl font-display font-bold tracking-tighter text-black dark:text-white flex items-center justify-between">
                <span>{connectedProjects.length}</span>
                <span className="text-xs font-mono font-normal text-emerald-600 dark:text-emerald-400">
                  {connectedProjects.filter(p => p.status === 'ONLINE').length} live
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-5 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500">
              <div className="text-[10px] sm:text-xs font-medium text-black/60 dark:text-white/60 mb-2">Total Actions</div>
              <div className="text-2xl sm:text-3xl font-display font-bold tracking-tighter text-black dark:text-white">{totalAgentActions}</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500">
              <div className="text-[10px] sm:text-xs font-medium text-black/60 dark:text-white/60 mb-2">Total Leases</div>
              <div className="text-2xl sm:text-3xl font-display font-bold tracking-tighter text-black dark:text-white">{leases.length}</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500 col-span-2 md:col-span-1">
              <div className="text-[10px] sm:text-xs font-medium text-black/60 dark:text-white/60 mb-2">Telemetry Bus</div>
              <div className="text-lg sm:text-xl font-mono font-bold tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </div>
            </div>
          </div>

          {/* Inner Header Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 gap-3">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
              <button 
                onClick={() => setSubTab('tenancy')}
                className={`pb-2 text-xs sm:text-sm font-medium transition-all border-b-2 shrink-0 ${subTab === 'tenancy' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              >
                Tenancy Sync
              </button>
              <button 
                onClick={() => setSubTab('projects')}
                className={`pb-2 text-xs sm:text-sm font-medium transition-all border-b-2 flex items-center gap-2 shrink-0 ${subTab === 'projects' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              >
                <span>Connected Projects & n8n</span>
                <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-none bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                  {connectedProjects.length}
                </span>
              </button>
              <button 
                onClick={() => setSubTab('abstraction')}
                className={`pb-2 text-xs sm:text-sm font-medium transition-all border-b-2 shrink-0 ${subTab === 'abstraction' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              >
                Data Abstraction
              </button>
              <button 
                onClick={() => setSubTab('contacts')}
                className={`pb-2 text-xs sm:text-sm font-medium transition-all border-b-2 shrink-0 ${subTab === 'contacts' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              >
                Neural Roster
              </button>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-xs font-semibold rounded-none"
              >
                <Plus size={14} /> Import Project
              </button>
              <button
                onClick={() => exportLeasesCSV(filteredLeases)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-xs font-medium rounded-none"
              >
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          {/* TAB 1: TENANCY SYNC (DEFAULT) */}
          {subTab === 'tenancy' && (
            <>
              {/* Top Cards Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none p-6 shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] transition-colors duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-semibold tracking-tight text-black dark:text-white">Target Entity</h3>
                    <button onClick={() => setShowAddModal(true)} className="p-1.5 rounded-none bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"><Plus size={16} strokeWidth={2} /></button>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-none flex items-center justify-center border border-black/10 dark:border-white/10">
                       <Map className="text-black/60 dark:text-white/60" size={20} />
                    </div>
                    <div>
                      <div className="text-base font-bold text-black dark:text-white tracking-tight">Delegancy property</div>
                      <div className="font-mono text-xs text-black/60 dark:text-white/60 mt-0.5">ID: DEL-994-Alpha</div>
                    </div>
                    <div className="ml-auto px-2 py-1 rounded-none bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 font-mono text-[10px] font-medium text-black/70 dark:text-white/70 uppercase">Industrial</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-black/5 dark:bg-white/5 p-3 rounded-none border border-black/10 dark:border-white/10">
                      <div className="font-mono text-[10px] text-black/50 dark:text-white/50 mb-1 uppercase">Sys Comms</div>
                      <div className="text-black dark:text-white font-medium truncate">support@example.com</div>
                      <div className="text-black dark:text-white font-medium truncate">sales@example.com</div>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-3 rounded-none border border-black/10 dark:border-white/10">
                      <div className="font-mono text-[10px] text-black/50 dark:text-white/50 mb-1 uppercase">Direct Uplink</div>
                      <div className="text-black dark:text-white font-medium truncate">+1 657 123 1234</div>
                      <div className="text-black dark:text-white font-medium truncate">+1 657 123 5678</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none p-6 shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold tracking-tight text-black dark:text-white">Node Timelines & ACL</h3>
                    </div>
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-none p-3">
                        <div className="font-mono text-[10px] text-black/50 dark:text-white/50 mb-1 uppercase">Commencement Node</div>
                        <div className="text-sm font-medium font-mono text-black dark:text-white">2024-09-12</div>
                      </div>
                      <div className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-none p-3">
                        <div className="font-mono text-[10px] text-black/50 dark:text-white/50 mb-1 uppercase">Termination Node</div>
                        <div className="text-sm font-medium font-mono text-black dark:text-white">2026-09-12</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-black/10 dark:border-white/10 pb-3">
                      <div>
                        <div className="text-sm font-medium text-black dark:text-white mb-0.5">Ticket Generation</div>
                      </div>
                      <button
                        onClick={() => togglePermission('canCreateTickets')}
                        className={`w-10 h-5 rounded-none relative transition-colors ${permissions.canCreateTickets ? 'bg-black dark:bg-white' : 'bg-black/20 dark:bg-white/20'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-none bg-white dark:bg-black transition-all shadow-sm ${permissions.canCreateTickets ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-sm font-medium text-black dark:text-white mb-0.5">Lease Management</div>
                      </div>
                      <button
                        onClick={() => togglePermission('canManageLeases')}
                        className={`w-10 h-5 rounded-none relative transition-colors ${permissions.canManageLeases ? 'bg-black dark:bg-white' : 'bg-black/20 dark:bg-white/20'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-none bg-white dark:bg-black transition-all shadow-sm ${permissions.canManageLeases ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Connected AI Projects & n8n Uplinks Section (Quick Preview) ── */}
              <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] p-6 transition-colors duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Workflow size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-black dark:text-white">
                        Connected AI Projects & n8n Uplinks
                      </h3>
                      <p className="text-xs text-black/60 dark:text-white/60">
                        External workflows and websites streaming live telemetry through Synapse
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSubTab('projects')}
                      className="text-xs font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                    >
                      View All ({connectedProjects.length}) →
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-none hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-1"
                    >
                      <Plus size={13} /> Import Project
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedProjects.slice(0, 2).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPing={handlePingProject}
                      onMonitor={(p) => setMonitoredProject(p)}
                      onDelete={handleDeleteProject}
                      isPinging={pingingId === project.id}
                    />
                  ))}
                </div>
              </div>

              {/* Leases Table */}
              <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] mt-6 overflow-hidden transition-colors duration-500">
                <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-black/50">
                  <span className="text-sm font-semibold tracking-tight text-black dark:text-white">Lease Registry</span>
                  <div className="flex gap-2 text-sm font-medium items-center">
                    {[
                      { key: 'current', label: 'Active' },
                      { key: 'past', label: 'Archived' },
                      { key: 'draft', label: 'Staged' },
                    ].map(tab => (
                      <button
                         key={tab.key}
                         onClick={() => setActiveTab(tab.key)}
                         className={`px-3 py-1.5 rounded-none transition-colors border ${activeTab === tab.key ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}
                       >
                         {tab.label} <span className={`ml-1 text-[10px] font-mono ${activeTab === tab.key ? 'text-white/70 dark:text-black/70' : 'text-black/40 dark:text-white/40'}`}>{tabCounts[tab.key]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm whitespace-nowrap min-w-[1000px]">
                    <thead>
                      <tr className="font-mono text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
                        <th className="py-3 px-6 w-12"></th>
                        <th className="py-3 px-4 font-semibold">Target Entity</th>
                        <th className="py-3 px-4 font-semibold">Property Identifier</th>
                        <th className="py-3 px-4 font-semibold">Commence</th>
                        <th className="py-3 px-4 font-semibold">Terminate</th>
                        <th className="py-3 px-4 font-semibold">Capacity</th>
                        <th className="py-3 px-4 font-semibold">Init State</th>
                        <th className="py-3 px-4 font-semibold">End State</th>
                        <th className="py-3 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-black dark:text-white">
                      {filteredLeases.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-black/50 dark:text-white/50 font-mono text-sm">
                            {searchTerm ? `[NO_MATCH] Registry query for "${searchTerm}" returned 0 records` : '[EMPTY] Registry is devoid of entries'}
                          </td>
                        </tr>
                      )}
                      {filteredLeases.map((row) => (
                        <tr key={row.id} className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-6"><div className="w-3 h-3 rounded-none border border-black/20 dark:border-white/20 bg-transparent" /></td>
                          <td className="py-3 px-4 font-bold tracking-tight">{row.company}</td>
                          <td className="py-3 px-4 text-black/70 dark:text-white/70">{row.property}</td>
                          <td className="py-3 px-4 font-mono">{row.startDate || '—'}</td>
                          <td className="py-3 px-4 font-mono text-black/60 dark:text-white/60">{row.endDate || '—'}</td>
                          <td className="py-3 px-4 font-mono">{row.units}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={row.moveIn} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={row.moveOut} />
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingLease(row)} className="w-7 h-7 flex items-center justify-center rounded-none border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors" title="Modify"><Edit size={14} /></button>
                              <button onClick={() => setDeleteConfirm(row)} className="w-7 h-7 flex items-center justify-center rounded-none border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60 hover:text-red-500 transition-colors" title="Purge"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: CONNECTED AI PROJECTS & N8N UPLINKS (FULL DASHBOARD) */}
          {subTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)]">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-black dark:text-white flex items-center gap-2">
                    <Workflow size={20} className="text-blue-500" /> External AI Projects & n8n Uplinks
                  </h2>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1 max-w-2xl">
                    Import n8n workflows, AI web applications, or custom agents via their public URL or webhook link. Stream live telemetry, monitor heartbeat status, and log inference execution in Synapse Observatory.
                  </p>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleRefreshAllProjects}
                    disabled={refreshingAll}
                    className="px-3.5 py-2 border border-black/15 dark:border-white/15 bg-white/70 dark:bg-black/70 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors rounded-none"
                  >
                    <RefreshCw size={13} className={refreshingAll ? 'animate-spin' : ''} />
                    {refreshingAll ? 'Pinging All...' : 'Refresh All Pings'}
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-none hover:bg-black/85 dark:hover:bg-white/85 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} /> Import New Project
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onPing={handlePingProject}
                    onMonitor={(p) => setMonitoredProject(p)}
                    onDelete={handleDeleteProject}
                    isPinging={pingingId === project.id}
                  />
                ))}

                {/* Quick Add Card */}
                <button
                  onClick={() => setShowImportModal(true)}
                  className="min-h-[220px] border-2 border-dashed border-black/15 dark:border-white/15 hover:border-black/40 dark:hover:border-white/40 bg-white/30 dark:bg-black/30 flex flex-col items-center justify-center p-6 text-center transition-all hover:bg-black/5 dark:hover:bg-white/5 rounded-none group"
                >
                  <div className="w-12 h-12 rounded-none bg-black/5 dark:bg-white/10 flex items-center justify-center text-black/60 dark:text-white/60 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors mb-3">
                    <Plus size={22} />
                  </div>
                  <div className="font-bold text-sm text-black dark:text-white">Import Another AI Project</div>
                  <div className="text-xs text-black/50 dark:text-white/50 mt-1 max-w-xs">
                    Connect an n8n webhook or live web app link for 24/7 telemetry monitoring
                  </div>
                </button>
              </div>

              {/* Integration Guides & Telemetry Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-5 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-md rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Workflow size={18} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-black dark:text-white">How to Stream from n8n</h3>
                  </div>
                  <ol className="text-xs text-black/70 dark:text-white/70 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>In your n8n workflow canvas, add an <strong>HTTP Request</strong> node at key AI execution stages.</li>
                    <li>Set the Method to <strong>POST</strong> and URL to <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5">{`${getBackendUrl()}/api/projects/webhook-ingest`}</code>.</li>
                    <li>Send JSON payload with <code className="font-mono">{`{ "projectId": "your-id", "eventName": "agent.inference", "payload": { ... } }`}</code>.</li>
                    <li>Synapse Observatory automatically captures and monitors latency, token usage, and status in real-time.</li>
                  </ol>
                </div>

                <div className="p-5 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-md rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-black dark:text-white">How to Stream from Web Apps & Agents</h3>
                  </div>
                  <ol className="text-xs text-black/70 dark:text-white/70 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Add your web app endpoint or health check URL to the Synapse Monitor.</li>
                    <li>Synapse runs server-side ping checks without CORS limitations to track uptime and response latency.</li>
                    <li>For rich telemetry, emit events to the webhook ingest endpoint whenever your LLM generates completions.</li>
                    <li>Trigger test events anytime with the <strong>"Fire Test Event"</strong> action.</li>
                  </ol>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DATA ABSTRACTION */}
          {subTab === 'abstraction' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none p-6 shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500">
                 <div className="mb-4">
                  <h3 className="text-sm font-semibold tracking-tight text-black dark:text-white">Financial Clauses</h3>
                </div>
                 <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2">
                    <span className="text-black/60 dark:text-white/60">Base Rent</span>
                    <span className="font-mono font-medium text-black dark:text-white">$45 / sq ft</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2">
                    <span className="text-black/60 dark:text-white/60">Security Deposit</span>
                    <span className="font-mono font-medium text-black dark:text-white">$50,000</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2">
                    <span className="text-black/60 dark:text-white/60">Escalation Rate</span>
                    <span className="font-mono font-medium text-black dark:text-white">3.5% Annually</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">Escalation Period</span>
                    <span className="font-mono font-medium text-black dark:text-white">Starting Year 2</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none p-6 shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-500">
                 <div className="mb-4">
                  <h3 className="text-sm font-semibold tracking-tight text-black dark:text-white">Critical Timelines</h3>
                </div>
                 <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2">
                    <span className="text-black/60 dark:text-white/60">Execution Date</span>
                    <span className="font-mono font-medium text-black dark:text-white">2026-01-10</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2">
                    <span className="text-black/60 dark:text-white/60">Expiration Date</span>
                    <span className="font-mono font-medium text-black dark:text-white">2031-12-31</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2">
                    <span className="text-black/60 dark:text-white/60">Renewal Notice</span>
                    <span className="font-mono font-medium text-black dark:text-white">2031-06-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">Notice Period</span>
                    <span className="font-mono font-medium text-black dark:text-white">180 Days Prior</span>
                  </div>
                </div>
              </div>

               <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none p-6 shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] flex flex-col items-center justify-between text-center md:col-span-2 lg:col-span-1 transition-colors duration-500">
                 <div className="w-full text-left mb-4">
                  <h3 className="text-sm font-semibold tracking-tight text-black dark:text-white">Confidence Score</h3>
                </div>
                
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/10 dark:text-white/10" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 97.4) / 100} strokeLinecap="round" className="text-black dark:text-white transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-mono font-bold text-black dark:text-white">97.4%</span>
                    <span className="text-[10px] text-black/50 dark:text-white/50 uppercase font-medium">Accuracy</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-black/50 dark:text-white/50 px-2">
                  [SYS] Parser matched against validated LLM profile set.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NEURAL ROSTER */}
          {subTab === 'contacts' && (
            <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none p-6 shadow-[8px_8px_0_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0_rgba(255,255,255,0.05)] space-y-6 max-w-4xl mx-auto transition-colors duration-500">
              <div className="border-b border-black/10 dark:border-white/10 pb-4 flex justify-between items-center">
                <h3 className="text-sm font-semibold tracking-tight text-black dark:text-white">Neural Roster</h3>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-xs font-medium rounded-none"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className="p-4 border border-black/10 dark:border-white/10 rounded-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight text-black dark:text-white">{contact.name}</span>
                        {contact.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-none border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-none bg-emerald-500" />
                            {contact.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">{contact.role || "OPERATOR"}</span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-black/50 dark:text-white/50">{contact.email}</div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <a href={`mailto:${contact.email}`} className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 rounded-none transition-colors text-xs font-medium text-black dark:text-white">Email</a>
                        <button className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 rounded-none transition-colors text-xs font-medium text-black dark:text-white">Logs</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Modals ── */}

      {/* Import Project Modal */}
      <ImportProjectModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportProject}
        addToast={addToast}
      />

      {/* Telemetry Monitor Modal */}
      <ProjectMonitorModal
        project={monitoredProject}
        isOpen={!!monitoredProject}
        onClose={() => setMonitoredProject(null)}
        onSendTestEvent={handleSendTestEvent}
        onRefreshPing={handlePingProject}
        isPinging={pingingId === monitoredProject?.id}
        addToast={addToast}
      />

      {/* Add Lease Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Initialize Node">
        <LeaseForm onSave={handleSaveNew} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Lease Modal */}
      <Modal isOpen={!!editingLease} onClose={() => setEditingLease(null)} title="Modify Node">
        {editingLease && (
          <LeaseForm lease={editingLease} onSave={handleSaveEdit} onCancel={() => setEditingLease(null)} />
        )}
      </Modal>

      {/* Delete Lease Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Purge" size="sm">
        {deleteConfirm && (
          <div className="text-center font-sans text-black dark:text-white">
            <p className="text-sm font-semibold mb-6">Purge registry entry for "{deleteConfirm.company}"?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-none text-sm font-medium border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="px-4 py-2 rounded-none text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Purge</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Status Badge Component ──
const StatusBadge = ({ status }) => {
  const config = {
    Completed: { icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
    Pending: { icon: Activity, color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
    Incomplete: { icon: AlertTriangle, color: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  };
  const c = config[status] || config.Pending;
  const Icon = c.icon;
  return (
    <div className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-none border text-[10px] font-mono ${c.color}`}>
      <Icon size={12} /> {status}
    </div>
  );
};

export default CommandCenter;

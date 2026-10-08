import { useState } from 'react';
import { Cpu, Clock, DollarSign, Brain, Crosshair, RotateCcw } from 'lucide-react';

const STATUS_COLORS = {
  running: { dot: 'green', text: '#10B981', label: 'RUNNING' },
  idle: { dot: 'green', text: '#10B981', label: 'IDLE' },
  warning: { dot: 'amber', text: '#F59E0B', label: 'WARNING' },
  critical: { dot: 'red', text: '#EF4444', label: 'CRITICAL' },
  paused: { dot: 'amber', text: '#F59E0B', label: 'PAUSED' },
  killed: { dot: 'gray', text: '#6B7280', label: 'KILLED' },
};

const AGENT_ICONS = {
  alpha: '⍺',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
};

export default function AgentCard({ agent, onKill, onRestart }) {
  const [hovered, setHovered] = useState(false);

  if (!agent) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-4 bg-black/5 rounded-md w-2/3 mb-3 border border-black/10" />
        <div className="h-3 bg-black/5 rounded-md w-1/2 mb-6 border border-black/10" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-black/5 rounded-md border border-black/10" />
          ))}
        </div>
      </div>
    );
  }

  const status = STATUS_COLORS[agent.status] || STATUS_COLORS.idle;
  const isRogue = agent.status === 'critical';
  const isCascade = agent.status === 'warning';
  const isPaused = agent.status === 'paused';
  const isKilled = agent.status === 'killed';

  const cardClass = isRogue ? 'glass-card rogue-card'
    : (isCascade || isPaused) ? 'glass-card cascade-card'
    : 'glass-card';

  const confidenceColor = agent.confidenceScore > 0.8 ? '#10B981'
    : agent.confidenceScore > 0.5 ? '#F59E0B'
    : '#EF4444';

  const formatTokens = (n) => {
    if (!n) return '0';
    if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div
      className={`${cardClass} p-4 relative group transition-all duration-300`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3 border-b border-black/10 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-md border flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{
              borderColor: isKilled ? 'rgba(0, 0, 0, 0.1)' : `${status.text}40`,
              background: isKilled ? 'rgba(0, 0, 0, 0.05)' : `${status.text}10`,
              color: status.text,
            }}
          >
            {AGENT_ICONS[agent.agentId]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight truncate">{agent.agentName}</h3>
              <span className={`status-dot ${status.dot}`} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="badge border border-black/10 bg-black/5 text-black/60 font-mono">
                {agent.model}
              </span>
              <span
                className="badge border font-mono"
                style={{
                  borderColor: `${status.text}30`,
                  background: `${status.text}10`,
                  color: status.text,
                }}
              >
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Current Task ── */}
      <p className={`text-xs mb-3 leading-relaxed line-clamp-2 ${
        isRogue ? 'text-red-400 font-medium' : isCascade ? 'text-amber-400/80' : isPaused ? 'text-amber-600 font-medium' : 'text-gray-500 italic'
      }`}>
        {agent.currentTask}
      </p>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-black/5 border border-black/10 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Tokens</span>
          </div>
          <p className={`text-sm font-bold font-mono ${isRogue ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTokens(agent.tokenUsage?.total)}
          </p>
        </div>
        <div className="bg-black/5 border border-black/10 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Cost</span>
          </div>
          <p className={`text-sm font-bold font-mono ${
            agent.cumulativeCostUSD > 100 ? 'text-red-600' : agent.cumulativeCostUSD > 20 ? 'text-amber-600' : 'text-gray-900'
          }`}>
            ${agent.cumulativeCostUSD?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-black/5 border border-black/10 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Latency</span>
          </div>
          <p className="text-sm font-bold font-mono text-gray-900">
            {agent.latencyMs || 0}<span className="text-[10px] text-gray-500 ml-0.5">ms</span>
          </p>
        </div>
        <div className="bg-black/5 border border-black/10 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Confidence</span>
          </div>
          <p className="text-sm font-bold font-mono" style={{ color: confidenceColor }}>
            {((agent.confidenceScore || 0) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* ── Confidence Bar ── */}
      <div className="confidence-bar mb-3">
        <div
          className="confidence-fill"
          style={{
            width: `${(agent.confidenceScore || 0) * 100}%`,
            backgroundColor: confidenceColor,
          }}
        />
      </div>

      {/* ── Reasoning Chain ── */}
      {agent.reasoningChain && agent.reasoningChain.length > 0 && (
        <div className="space-y-1">
          {agent.reasoningChain.slice(-3).map((step, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-[9px] text-gray-700 font-mono mt-0.5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className={`text-[10px] font-mono leading-relaxed truncate ${
                isRogue ? 'text-red-500/70' : isCascade ? 'text-amber-500/60' : isPaused ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {step}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Action Buttons (on hover) ── */}
      <div className={`absolute top-3 right-3 flex gap-1.5 transition-all duration-200 ${
        hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
      }`}>
        {isKilled ? (
          <button
            onClick={onRestart}
            className="w-7 h-7 rounded-md border border-black/10 bg-white hover:bg-black/5 flex items-center justify-center transition-colors shadow-sm"
            title="Restart Agent"
          >
            <RotateCcw size={12} className="text-emerald-600" />
          </button>
        ) : (
          <button
            onClick={onKill}
            className="w-7 h-7 rounded-md border border-black/10 bg-white hover:bg-black/5 flex items-center justify-center transition-colors shadow-sm"
            title="Kill Agent"
          >
            <Crosshair size={12} className="text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}

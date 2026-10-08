import { Wrench, PlayCircle, AlertTriangle } from 'lucide-react';

export default function MaintenancePanel({ agents, resumeAgent }) {
  const pausedAgents = Object.values(agents).filter(a => a.status === 'paused');

  if (pausedAgents.length === 0) return null;

  return (
    <div className="glass-card p-5 rounded-lg border border-amber-500/30 bg-amber-50/50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            System Maintenance Required
          </h3>
        </div>
        <span className="badge border border-amber-500/30 bg-amber-500/10 text-amber-700">
          {pausedAgents.length} Agent{pausedAgents.length > 1 ? 's' : ''} Paused
        </span>
      </div>

      <div className="space-y-3">
        {pausedAgents.map(agent => (
          <div key={agent.agentId} className="flex items-center justify-between bg-white/80 p-3 rounded-lg border border-black/5 shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-900">{agent.agentName}</span>
                <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                  {agent.agentId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                <span className="truncate">{agent.pauseReason || 'Auto-Safeguard Triggered'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Confidence</div>
                <div className="text-sm font-bold font-mono text-gray-900">
                  {((agent.confidenceScore || 0) * 100).toFixed(0)}%
                </div>
              </div>
              <button
                onClick={() => resumeAgent(agent.agentId)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm transition-colors"
              >
                <PlayCircle size={14} />
                Fix & Resume
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

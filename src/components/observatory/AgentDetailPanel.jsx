import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import styles from '../../views/Observatory.module.css';

export const AgentDetailPanel = ({
  selectedAgent,
  setSelectedAgent,
  agentStatuses,
  agentApprovals,
  approveRequest,
  rejectRequest,
  agentLogs,
  logEndRef
}) => {
  return (
    <div className={`${styles.detailPanel} ${selectedAgent ? styles.detailPanelOpen : ''}`}>
      {selectedAgent && agentStatuses[selectedAgent] && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-black/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agentStatuses[selectedAgent].icon}</span>
              <div>
                <div className="text-sm font-bold text-black dark:text-white tracking-tight">
                  {agentStatuses[selectedAgent].name}
                </div>
                <div className="font-mono text-[10px] text-black/50 dark:text-white/50 uppercase">
                  {selectedAgent}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="w-7 h-7 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-px bg-black/5 dark:bg-white/5">
            <div className="p-3 bg-white/80 dark:bg-black/80 text-center">
              <div className="text-lg font-bold font-mono text-black dark:text-white">
                {agentStatuses[selectedAgent].actions}
              </div>
              <div className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase">Actions</div>
            </div>
            <div className="p-3 bg-white/80 dark:bg-black/80 text-center">
              <div className={`text-lg font-bold font-mono ${
                agentStatuses[selectedAgent].status === 'processing' 
                  ? 'text-cyan-600 dark:text-cyan-400' 
                  : 'text-black dark:text-white'
              }`}>
                {agentStatuses[selectedAgent].status === 'processing' ? 'ACTIVE' : 'IDLE'}
              </div>
              <div className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase">Status</div>
            </div>
            <div className="p-3 bg-white/80 dark:bg-black/80 text-center">
              <div className="text-lg font-bold font-mono text-black dark:text-white">
                ${(agentStatuses[selectedAgent].actions * 0.023).toFixed(2)}
              </div>
              <div className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase">Cost</div>
            </div>
          </div>

          {/* Pending Approvals */}
          {agentApprovals.filter(a => a.agent === selectedAgent).length > 0 && (
            <div className="p-4 border-b border-black/10 dark:border-white/10">
              <div className="text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 uppercase mb-2">
                ⚠ Pending Approvals
              </div>
              {agentApprovals.filter(a => a.agent === selectedAgent).map(approval => (
                <div key={approval.id} className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-2">
                  <div className="text-xs font-mono font-medium text-black dark:text-white mb-1">{approval.id}</div>
                  <div className="text-[11px] text-black/60 dark:text-white/60 mb-2">{approval.description}</div>
                  <div className="text-xs font-mono font-bold text-black dark:text-white mb-3">
                    ${approval.amount.toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveRequest(approval.id)}
                      className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={12} /> Approve
                    </button>
                    <button
                      onClick={() => rejectRequest(approval.id)}
                      className="flex-1 py-1.5 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity Log */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-black/50 dark:text-white/50 uppercase">
                Activity Log
              </span>
              <span className="text-[10px] font-mono text-black/30 dark:text-white/30">
                {agentLogs.length} entries
              </span>
            </div>
            <div className={`${styles.activityLog} flex-1`}>
              {agentLogs.length === 0 && (
                <div className="text-black/30 dark:text-white/30 text-center py-8">
                  No activity yet. Run a scenario →
                </div>
              )}
              {agentLogs.map((entry) => (
                <div key={entry.id} className={styles.logEntry}>
                  <div className="flex items-start gap-2">
                    <span className={`text-[9px] font-mono shrink-0 mt-px ${
                      entry.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                      entry.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                      entry.type === 'error' ? 'text-red-600 dark:text-red-400' :
                      'text-black/40 dark:text-white/40'
                    }`}>
                      [{entry.timestamp.toLocaleTimeString()}]
                    </span>
                    <span className="text-black/70 dark:text-white/70 break-all">
                      {entry.message}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

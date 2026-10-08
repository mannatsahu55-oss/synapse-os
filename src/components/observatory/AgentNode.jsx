import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import styles from '../../views/Observatory.module.css';

export const AgentNode = ({ data, selected }) => {
  const { agent, onClick } = data;
  const isProcessing = agent.status === 'processing';
  const isError = agent.status === 'error';

  return (
    <div
      className={`${styles.agentNode} ${isProcessing ? styles.agentNodeProcessing : ''}`}
      onClick={() => onClick?.(agent.id)}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{agent.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-black dark:text-white tracking-tight truncate">
            {agent.name}
          </div>
          <div className="font-mono text-[10px] text-black/50 dark:text-white/50 uppercase">
            {agent.id}
          </div>
        </div>
        <div
          className={`${styles.statusDot} ${
            isProcessing ? styles.statusProcessing : 
            isError ? styles.statusError : 
            styles.statusIdle
          }`}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-black/40 dark:text-white/40">
          <Zap size={10} />
          <span>{agent.actions} actions</span>
        </div>
        <div className={`text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 ${
          isProcessing 
            ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10' 
            : isError 
            ? 'text-red-600 dark:text-red-400 bg-red-500/10' 
            : 'text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5'
        }`}>
          {agent.status}
        </div>
      </div>

      {/* Cost tracker bar */}
      <div className={`${styles.costBar} mt-3`}>
        <div
          className={styles.costBarFill}
          style={{
            width: `${Math.min(100, (agent.actions / 50) * 100)}%`,
            background: isProcessing 
              ? 'linear-gradient(90deg, #06b6d4, #3b82f6)' 
              : 'rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </div>
  );
};

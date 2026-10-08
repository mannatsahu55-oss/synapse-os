import React from 'react';
import { Activity, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import styles from '../../views/Observatory.module.css';

export const TimelinePanel = ({
  timelineOpen,
  setTimelineOpen,
  timelineEntries,
  activeScenario,
  scenarioRunning
}) => {
  return (
    <>
      <div className={`${styles.timelinePanel} ${timelineOpen && timelineEntries.length > 0 ? styles.timelinePanelOpen : ''}`}>
        {/* Timeline header */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-black/50 dark:text-white/50" />
            <span className="text-[11px] font-mono font-medium text-black/60 dark:text-white/60 uppercase">
              {activeScenario ? activeScenario.title : 'Decision Timeline'}
            </span>
            {scenarioRunning && (
              <div className="w-2.5 h-2.5 border-2 border-cyan-500 border-t-transparent animate-spin" />
            )}
          </div>
          <button
            onClick={() => setTimelineOpen(false)}
            className="text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Timeline track */}
        <div className={styles.timelineTrack}>
          {timelineEntries.map((entry, i) => (
            <div
              key={i}
              className={`${styles.timelineEntry} ${
                entry.status === 'active' ? styles.timelineEntryActive :
                entry.status === 'completed' ? styles.timelineEntryCompleted : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {entry.status === 'completed' ? (
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                ) : entry.status === 'active' ? (
                  <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <Clock size={12} className="text-black/30 dark:text-white/30 shrink-0" />
                )}
                <span className="text-[11px] font-bold text-black dark:text-white truncate">
                  {entry.title}
                </span>
              </div>
              <div className="text-[10px] text-black/50 dark:text-white/50 line-clamp-2">
                {entry.desc}
              </div>
              {entry.output && (
                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="text-[9px] font-mono text-black/40 dark:text-white/40 line-clamp-2 break-all">
                    {entry.output.slice(0, 80)}...
                  </div>
                </div>
              )}
              {i < timelineEntries.length - 1 && <div className={styles.timelineConnector} />}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline toggle (when collapsed) */}
      {!timelineOpen && timelineEntries.length > 0 && (
        <button
          onClick={() => setTimelineOpen(true)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-[11px] font-mono text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors shadow-lg"
        >
          <ChevronUp size={12} />
          Show Timeline ({timelineEntries.filter(e => e.status === 'completed').length}/{timelineEntries.length})
        </button>
      )}
    </>
  );
};

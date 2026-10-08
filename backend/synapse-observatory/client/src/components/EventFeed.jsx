import { useRef, useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const TYPE_STYLES = {
  INFO: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.2)' },
  WARNING: { bg: 'rgba(245, 158, 11, 0.1)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.2)' },
  ERROR: { bg: 'rgba(239, 68, 68, 0.1)', text: '#F87171', border: 'rgba(239, 68, 68, 0.2)' },
  CRITICAL: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
};

const AGENT_COLORS = {
  alpha: '#3B82F6',
  beta: '#8B5CF6',
  gamma: '#10B981',
  delta: '#F59E0B',
};

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '--:--:--';
  }
}

export default function EventFeed({ events, selectedAgent, setSelectedAgent }) {
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!isHovering && containerRef.current && events.length > prevCountRef.current) {
      containerRef.current.scrollTop = 0;
    }
    prevCountRef.current = events.length;
  }, [events, isHovering]);

  return (
    <div className="glass-card p-5 h-full flex flex-col rounded-lg" style={{ minHeight: '320px' }}>
      <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-gray-500 animate-pulse" />
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
            Live Event Feed
            {selectedAgent && (
              <button 
                onClick={() => setSelectedAgent(null)}
                className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[9px] hover:bg-gray-300 transition-colors"
              >
                Clear Filter ({selectedAgent}) ✕
              </button>
            )}
          </h3>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          {events.length} events
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-0"
        style={{ maxHeight: '280px' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-700 text-xs">
            Waiting for events...
          </div>
        ) : (
          events
            .filter(e => !selectedAgent || e.agent === selectedAgent)
            .map(event => {
            const typeStyle = TYPE_STYLES[event.type] || TYPE_STYLES.INFO;
            const agentColor = AGENT_COLORS[event.agent] || '#6B7280';
            const isCritical = event.type === 'CRITICAL';

            return (
              <div
                key={event.id}
                className={`event-row py-2 px-2 flex items-start gap-2 border-b border-black/5 hover:bg-black/5 transition-colors ${
                  isCritical ? 'bg-red-50 hover:bg-red-100' : ''
                }`}
              >
                {/* Timestamp */}
                <span className="text-[10px] font-mono text-gray-500 flex-shrink-0 mt-0.5 w-[58px]">
                  {formatTime(event.timestamp)}
                </span>

                {/* Agent badge */}
                {event.agent && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5 w-[38px] text-center"
                    style={{ color: agentColor }}
                  >
                    {event.agent}
                  </span>
                )}

                {/* Type badge */}
                <span
                  className="badge flex-shrink-0 mt-0.5"
                  style={{
                    background: typeStyle.bg,
                    color: typeStyle.text,
                    border: `1px solid ${typeStyle.border}`,
                    fontSize: '8px',
                  }}
                >
                  {event.type}
                </span>

                {/* Description */}
                <p className={`text-[11px] leading-relaxed flex-1 min-w-0 ${
                  isCritical ? 'text-red-600 font-medium' : 'text-gray-700'
                }`}>
                  {event.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

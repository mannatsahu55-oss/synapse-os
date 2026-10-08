import { useMemo } from 'react';

const NODES = [
  { id: 'alpha', label: 'Alpha', name: 'Data Ingestion', x: 130, y: 80 },
  { id: 'beta', label: 'Beta', name: 'Analysis', x: 330, y: 80 },
  { id: 'gamma', label: 'Gamma', name: 'Decision', x: 530, y: 80 },
  { id: 'delta', label: 'Delta', name: 'Execution', x: 730, y: 80 },
];

const LINKS = [
  { from: 'alpha', to: 'beta' },
  { from: 'beta', to: 'gamma' },
  { from: 'gamma', to: 'delta' },
];

const STATUS_FILL = {
  running: '#10B981',
  idle: '#10B981',
  warning: '#F59E0B',
  critical: '#EF4444',
  killed: '#374151',
};

const STATUS_GLOW = {
  running: 'rgba(16, 185, 129, 0.3)',
  idle: 'rgba(16, 185, 129, 0.2)',
  warning: 'rgba(245, 158, 11, 0.3)',
  critical: 'rgba(239, 68, 68, 0.5)',
  killed: 'transparent',
};

export default function SwarmTopology({ agents, selectedAgent, setSelectedAgent }) {
  const nodeData = useMemo(() => {
    return NODES.map(node => {
      const agent = agents[node.id];
      const status = agent?.status || 'idle';
      const isSelected = selectedAgent === node.id;
      const isDimmed = selectedAgent !== null && !isSelected;
      return { ...node, status, agent, isSelected, isDimmed };
    });
  }, [agents, selectedAgent]);

  const linkData = useMemo(() => {
    return LINKS.map(link => {
      const fromAgent = agents[link.from];
      const toAgent = agents[link.to];
      const fromStatus = fromAgent?.status || 'idle';
      const toStatus = toAgent?.status || 'idle';

      let color = '#10B981';
      let lineClass = 'flow-line';

      if (fromStatus === 'killed' || toStatus === 'killed') {
        color = '#374151';
        lineClass = 'flow-line-stopped';
      } else if (fromStatus === 'critical' || (link.from === 'gamma' && fromAgent?.status === 'critical')) {
        color = '#EF4444';
        lineClass = 'flow-line-fast';
      } else if (fromStatus === 'warning' || toStatus === 'warning') {
        color = '#F59E0B';
        lineClass = 'flow-line';
      }

      const fromNode = NODES.find(n => n.id === link.from);
      const toNode = NODES.find(n => n.id === link.to);

      return {
        ...link,
        color,
        lineClass,
        x1: fromNode.x + 38,
        y1: fromNode.y,
        x2: toNode.x - 38,
        y2: toNode.y,
      };
    });
  }, [agents]);

  return (
    <div className="glass-card p-5 rounded-lg">

      <svg viewBox="0 0 860 160" className="w-full" style={{ maxHeight: '160px' }}>
        <defs>
          <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#10B981" opacity="0.5" />
          </marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#EF4444" opacity="0.7" />
          </marker>
          <marker id="arrowAmber" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#F59E0B" opacity="0.5" />
          </marker>
          <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#374151" opacity="0.3" />
          </marker>
        </defs>

        {/* ── Connection Lines ── */}
        {linkData.map((link, i) => {
          const markerColor = link.color === '#EF4444' ? 'Red'
            : link.color === '#F59E0B' ? 'Amber'
            : link.color === '#374151' ? 'Gray'
            : 'Green';

          return (
            <g key={i}>
              {/* Base line (faint) */}
              <line
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke={link.color}
                strokeWidth="1"
                opacity="0.15"
              />
              {/* Animated flowing dots */}
              <line
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke={link.color}
                strokeWidth="2.5"
                className={link.lineClass}
                markerEnd={`url(#arrow${markerColor})`}
              />
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {nodeData.map(node => {
          const fill = STATUS_FILL[node.status] || STATUS_FILL.idle;
          const isRogue = node.status === 'critical';
          const isKilled = node.status === 'killed';
          const opacityMultiplier = node.isDimmed ? 0.3 : 1;

          return (
            <g 
              key={node.id} 
              onClick={() => setSelectedAgent(node.isSelected ? null : node.id)}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
              opacity={opacityMultiplier}
              className="hover:opacity-100"
            >
              {/* Outer glow ring */}
              {!isKilled && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="42"
                  fill="none"
                  stroke={fill}
                  strokeWidth="1"
                  opacity={isRogue ? 0.4 : 0.15}
                  className={isRogue ? 'node-rogue' : ''}
                />
              )}

              {/* Main circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="32"
                fill={`${fill}20`}
                stroke={fill}
                strokeWidth="2"
                className={!isKilled && !isRogue ? 'node-pulse' : isRogue ? 'node-rogue' : ''}
              />

              {/* Label */}
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isKilled ? '#6B7280' : '#000000'}
                fontSize="16"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
              >
                {node.label[0]}
              </text>

              {/* Name below */}
              <text
                x={node.x}
                y={node.y + 50}
                textAnchor="middle"
                fill={isKilled ? '#6B7280' : '#4B5563'}
                fontSize="10"
                fontWeight="500"
                fontFamily="Inter, sans-serif"
              >
                {node.name}
              </text>

              {/* Status label */}
              <text
                x={node.x}
                y={node.y + 63}
                textAnchor="middle"
                fill={fill}
                fontSize="8"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
                letterSpacing="0.5"
              >
                {node.status.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

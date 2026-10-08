import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

const AGENT_COLORS = {
  alpha: { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.15)' },
  beta: { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.15)' },
  gamma: { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.15)' },
  delta: { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)' },
};

const AGENT_NAMES = {
  alpha: 'Alpha',
  beta: 'Beta',
  gamma: 'Gamma',
  delta: 'Delta',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="p-3 border shadow-sm rounded-none"
      style={{
        background: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <p className="text-[10px] text-gray-500 font-mono mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-none"
                style={{ background: entry.color }}
              />
              <span className="text-[11px] text-gray-500">
                {AGENT_NAMES[entry.dataKey]}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-gray-900">
              {entry.value?.toLocaleString() || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div className="flex items-center justify-center gap-5 mt-2">
      {payload?.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-none"
            style={{ background: entry.color }}
          />
          <span className="text-[10px] text-gray-500 font-medium">
            {AGENT_NAMES[entry.value] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MetricsChart({ tokenHistory }) {
  const chartData = useMemo(() => {
    if (!tokenHistory || tokenHistory.length === 0) return [];

    const sampled = [];
    const step = Math.max(1, Math.floor(tokenHistory.length / 80));
    for (let i = 0; i < tokenHistory.length; i += step) {
      sampled.push(tokenHistory[i]);
    }
    if (sampled[sampled.length - 1] !== tokenHistory[tokenHistory.length - 1]) {
      sampled.push(tokenHistory[tokenHistory.length - 1]);
    }

    return sampled.map(point => ({
      ...point,
      timeLabel: point.timeLabel || new Date(point.time).toLocaleTimeString('en-US', {
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      }),
    }));
  }, [tokenHistory]);

  return (
    <div className="glass-card p-5 h-full flex flex-col rounded-lg" style={{ minHeight: '320px' }}>
      <div className="flex items-center gap-2 mb-3 border-b border-black/10 pb-3">
        <BarChart3 size={14} className="text-gray-500" />
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Token Usage Over Time
        </h3>
        <span className="text-[10px] text-gray-500 ml-auto font-mono">Last 2 min</span>
      </div>

      <div className="flex-1 min-h-0">
        {chartData.length < 2 ? (
          <div className="flex items-center justify-center h-full text-gray-700 text-xs">
            Collecting telemetry data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
            >
              <defs>
                {Object.entries(AGENT_COLORS).map(([id, colors]) => (
                  <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>

              <XAxis
                dataKey="timeLabel"
                tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)' }}
                axisLine={{ stroke: 'rgba(0,0,0,0.05)' }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)' }}
                axisLine={{ stroke: 'rgba(0,0,0,0.05)' }}
                tickLine={false}
                width={45}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />

              <Area
                type="monotone"
                dataKey="alpha"
                stroke={AGENT_COLORS.alpha.stroke}
                fill={`url(#grad-alpha)`}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="beta"
                stroke={AGENT_COLORS.beta.stroke}
                fill={`url(#grad-beta)`}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="gamma"
                stroke={AGENT_COLORS.gamma.stroke}
                fill={`url(#grad-gamma)`}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="delta"
                stroke={AGENT_COLORS.delta.stroke}
                fill={`url(#grad-delta)`}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Brain, Activity, AlertTriangle, DollarSign, Wifi, WifiOff, Zap } from 'lucide-react';
import AgentCard from './AgentCard';
import SwarmTopology from './SwarmTopology';
import CostTracker from './CostTracker';
import EventFeed from './EventFeed';
import KillSwitch from './KillSwitch';
import MetricsChart from './MetricsChart';
import MaintenancePanel from './MaintenancePanel';

const AGENT_ORDER = ['alpha', 'beta', 'gamma', 'delta'];

function StatCard({ icon: Icon, label, value, color, subtext }) {
  return (
    <div className="glass-card p-5 flex flex-col justify-between rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</div>
        <Icon size={14} style={{ color }} className="opacity-50" />
      </div>
      <div className="text-3xl font-bold tracking-tighter text-gray-900">{value}</div>
      {subtext && <div className="text-[10px] text-gray-500 mt-1 truncate">{subtext}</div>}
    </div>
  );
}

export default function Dashboard({
  agents,
  events,
  alerts,
  tokenHistory,
  systemStatus,
  isConnected,
  killAgent,
  killAll,
  restartAgent,
  restartAll,
  resumeAgent,
}) {
  const agentList = AGENT_ORDER.map(id => agents[id]).filter(Boolean);
  const activeAgentCount = agentList.filter(a => a.status !== 'killed').length;
  const activeAlertCount = systemStatus.alertCount || 0;
  const totalTokensFormatted = systemStatus.totalTokens >= 1000000
    ? `${(systemStatus.totalTokens / 1000000).toFixed(1)}M`
    : systemStatus.totalTokens >= 1000
    ? `${(systemStatus.totalTokens / 1000).toFixed(1)}K`
    : String(systemStatus.totalTokens || 0);

  const totalCost = systemStatus.totalCost || 0;
  const costColor = totalCost > 200 ? '#EF4444' : totalCost > 50 ? '#F59E0B' : '#10B981';

  const healthColor = systemStatus.systemHealth === 'critical' ? '#EF4444'
    : systemStatus.systemHealth === 'degraded' ? '#F59E0B'
    : '#10B981';
  const healthDotClass = systemStatus.systemHealth === 'critical' ? 'red'
    : systemStatus.systemHealth === 'degraded' ? 'amber'
    : 'green';
  const healthLabel = systemStatus.systemHealth === 'critical' ? 'CRITICAL ALERT'
    : systemStatus.systemHealth === 'degraded' ? 'DEGRADED'
    : 'All Systems Nominal';

  const allKilled = agentList.length > 0 && agentList.every(a => a.status === 'killed');

  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <div className="w-full h-full px-6 py-6 space-y-5">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Zap}
          label="Total Tokens"
          value={totalTokensFormatted}
          color="#8B5CF6"
          subtext="Cumulative across all agents"
        />
        <StatCard
          icon={Activity}
          label="Active Agents"
          value={`${activeAgentCount} / 4`}
          color={activeAgentCount === 4 ? '#10B981' : activeAgentCount > 0 ? '#F59E0B' : '#EF4444'}
          subtext={allKilled ? 'Swarm terminated' : 'Agents online'}
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={String(activeAlertCount)}
          color={activeAlertCount > 0 ? '#EF4444' : '#10B981'}
          subtext={activeAlertCount > 0 ? 'Action required' : 'No active alerts'}
        />
        <CostTracker
          totalCost={totalCost}
          costColor={costColor}
          burnRatePerMin={systemStatus.burnRatePerMin || 0}
          systemHealth={systemStatus.systemHealth}
        />
      </div>

      {/* ── Agent Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {AGENT_ORDER.map(id => (
          <AgentCard
            key={id}
            agent={agents[id]}
            onKill={() => killAgent(id)}
            onRestart={() => restartAgent(id)}
          />
        ))}
      </div>

      {/* ── Swarm Topology ── */}
      <SwarmTopology 
        agents={agents} 
        selectedAgent={selectedAgent} 
        setSelectedAgent={setSelectedAgent} 
      />

      {/* ── Maintenance Panel ── */}
      <MaintenancePanel agents={agents} resumeAgent={resumeAgent} />

      {/* ── Bottom Section: Chart + Event Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3">
          <MetricsChart tokenHistory={tokenHistory} />
        </div>
        <div className="lg:col-span-2">
          <EventFeed events={events} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} />
        </div>
      </div>

      {/* ── Kill Switch ── */}
      <KillSwitch
        killAll={killAll}
        restartAll={restartAll}
        allKilled={allKilled}
        systemHealth={systemStatus.systemHealth}
      />
    </div>
  );
}

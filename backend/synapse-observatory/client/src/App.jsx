import { useSocket } from './hooks/useSocket';
import Dashboard from './components/Dashboard';
import HallucinationAlert from './components/HallucinationAlert';

export default function App() {
  const {
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
    dismissAlert,
    clearAlerts,
  } = useSocket();

  return (
    <div className="h-full w-full bg-transparent overflow-y-auto">
      <HallucinationAlert
        alerts={alerts}
        agents={agents}
        systemStatus={systemStatus}
        killAgent={killAgent}
        killAll={killAll}
        dismissAlert={dismissAlert}
        clearAlerts={clearAlerts}
      />

      <Dashboard
        agents={agents}
        events={events}
        alerts={alerts}
        tokenHistory={tokenHistory}
        systemStatus={systemStatus}
        isConnected={isConnected}
        killAgent={killAgent}
        killAll={killAll}
        restartAgent={restartAgent}
        restartAll={restartAll}
        resumeAgent={resumeAgent}
      />
    </div>
  );
}

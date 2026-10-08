import { useMemo } from 'react';

export function useAgentStats(agentStatuses) {
  return useMemo(() => {
    const statuses = Object.values(agentStatuses || {});
    const totalAgentActions = statuses.reduce((sum, a) => sum + (a.actions || 0), 0);
    const activeAgents = statuses.filter(a => a.status !== 'offline').length;
    
    return {
      totalAgentActions,
      activeAgents
    };
  }, [agentStatuses]);
}

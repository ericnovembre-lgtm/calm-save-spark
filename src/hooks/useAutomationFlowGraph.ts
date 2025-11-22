import { useMemo } from 'react';

interface Automation {
  id: string;
  rule_name: string;
  is_active: boolean;
  action_config: { amount?: number };
}

interface FlowNode {
  id: string;
  label: string;
  type: 'source' | 'automation' | 'destination';
  position: { x: number; y: number };
  isActive?: boolean;
}

interface FlowConnection {
  from: string;
  to: string;
  isActive: boolean;
  label?: string;
}

interface FlowGraphData {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

/**
 * Hook to calculate node positions and connections for the money flow graph
 */
export function useAutomationFlowGraph(automations: Automation[]): FlowGraphData {
  return useMemo(() => {
    const nodes: FlowNode[] = [];
    const connections: FlowConnection[] = [];

    // Source node (Income)
    nodes.push({
      id: 'income',
      label: 'Income',
      type: 'source',
      position: { x: 100, y: 200 },
    });

    // Automation nodes (middle layer)
    automations.forEach((auto, idx) => {
      nodes.push({
        id: auto.id,
        label: auto.rule_name,
        type: 'automation',
        position: { x: 500, y: 80 + idx * 80 },
        isActive: auto.is_active,
      });

      // Connection from income to automation
      connections.push({
        from: 'income',
        to: auto.id,
        isActive: auto.is_active,
        label: auto.action_config?.amount ? `$${auto.action_config.amount}` : undefined,
      });
    });

    // Destination nodes
    const destinations = [
      { id: 'savings', label: 'Savings Goals', y: 150 },
      { id: 'emergency', label: 'Emergency Fund', y: 250 },
    ];

    destinations.forEach(dest => {
      nodes.push({
        id: dest.id,
        label: dest.label,
        type: 'destination',
        position: { x: 1100, y: dest.y },
      });
    });

    // Connections from automations to destinations (simplified distribution)
    automations.forEach((auto, idx) => {
      if (auto.is_active) {
        const destinationId = idx % 2 === 0 ? 'savings' : 'emergency';
        connections.push({
          from: auto.id,
          to: destinationId,
          isActive: true,
        });
      }
    });

    return { nodes, connections };
  }, [automations]);
}

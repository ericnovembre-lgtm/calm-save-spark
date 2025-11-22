import { motion } from 'framer-motion';
import { Wallet, Target, PiggyBank, TrendingUp, DollarSign } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FlowNode {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  type: 'source' | 'automation' | 'destination';
  isActive?: boolean;
  amount?: number;
}

interface FlowConnection {
  from: string;
  to: string;
  isActive: boolean;
  label?: string;
}

interface MoneyFlowGraphProps {
  automations: Array<{
    id: string;
    rule_name: string;
    is_active: boolean;
    action_config: { amount?: number };
  }>;
}

export function MoneyFlowGraph({ automations }: MoneyFlowGraphProps) {
  const prefersReducedMotion = useReducedMotion();

  // Build the flow nodes
  const nodes: FlowNode[] = [
    { id: 'income', label: 'Income', icon: Wallet, type: 'source' },
    ...automations.map(auto => ({
      id: auto.id,
      label: auto.rule_name,
      icon: TrendingUp,
      type: 'automation' as const,
      isActive: auto.is_active,
      amount: auto.action_config?.amount,
    })),
    { id: 'savings', label: 'Savings Goals', icon: Target, type: 'destination' },
    { id: 'emergency', label: 'Emergency Fund', icon: PiggyBank, type: 'destination' },
  ];

  // Build connections
  const connections: FlowConnection[] = automations.map(auto => ({
    from: 'income',
    to: auto.id,
    isActive: auto.is_active,
    label: auto.action_config?.amount ? `$${auto.action_config.amount}` : undefined,
  }));

  // Add connections from automations to destinations (simplified)
  automations.forEach(auto => {
    if (auto.is_active) {
      connections.push({
        from: auto.id,
        to: Math.random() > 0.5 ? 'savings' : 'emergency',
        isActive: true,
      });
    }
  });

  if (automations.length === 0) {
    return (
      <div className="circuit-board-container rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-circuit-accent/20 mb-4">
          <DollarSign className="w-8 h-8 text-circuit-accent" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Money Flows Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Create your first automation to see your money flow visualized
        </p>
      </div>
    );
  }

  return (
    <div className="circuit-board-container rounded-2xl p-6 overflow-x-auto">
      <svg
        width="100%"
        height="400"
        viewBox="0 0 1200 400"
        className="min-w-[800px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Active line gradient */}
          <linearGradient id="activeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--circuit-line))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--circuit-line))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--circuit-line))" stopOpacity="0.3" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw connections */}
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          // Calculate positions
          const fromIndex = nodes.findIndex(n => n.id === conn.from);
          const toIndex = nodes.findIndex(n => n.id === conn.to);
          
          const x1 = fromNode.type === 'source' ? 100 : fromNode.type === 'automation' ? 500 : 900;
          const y1 = fromNode.type === 'source' ? 200 : 80 + fromIndex * 80;
          const x2 = toNode.type === 'destination' ? 1100 : 500;
          const y2 = toNode.type === 'destination' ? (toNode.id === 'savings' ? 150 : 250) : 80 + toIndex * 80;

          // Control point for curved path
          const cx = (x1 + x2) / 2;

          return (
            <g key={`${conn.from}-${conn.to}-${idx}`}>
              {/* Connection line */}
              <motion.path
                d={`M ${x1} ${y1} Q ${cx} ${y1}, ${cx} ${(y1 + y2) / 2} T ${x2} ${y2}`}
                stroke={conn.isActive ? 'url(#activeLineGradient)' : 'hsl(var(--circuit-line-inactive))'}
                strokeWidth="2"
                fill="none"
                strokeDasharray={conn.isActive ? "5,5" : "1,3"}
                filter={conn.isActive ? "url(#glow)" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: conn.isActive ? 1 : 0.3,
                }}
                transition={{ duration: 1, delay: idx * 0.1 }}
              />

              {/* Animated flow particle */}
              {conn.isActive && !prefersReducedMotion && (
                <motion.circle
                  r="4"
                  fill="hsl(var(--circuit-line))"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{ 
                    offsetDistance: ["0%", "100%"],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.3,
                    ease: "linear",
                  }}
                  style={{
                    offsetPath: `path("M ${x1} ${y1} Q ${cx} ${y1}, ${cx} ${(y1 + y2) / 2} T ${x2} ${y2}")`,
                  }}
                />
              )}

              {/* Amount label */}
              {conn.label && conn.isActive && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 10}
                  fill="hsl(var(--circuit-accent))"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {conn.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Draw nodes */}
        {nodes.map((node, idx) => {
          const x = node.type === 'source' ? 100 : node.type === 'automation' ? 500 : 1100;
          const y = node.type === 'source' ? 200 : node.type === 'destination' ? (node.id === 'savings' ? 150 : 250) : 80 + idx * 80;

          return (
            <g key={node.id}>
              {/* Node circle */}
              <motion.circle
                cx={x}
                cy={y}
                r="30"
                fill="hsl(var(--circuit-bg))"
                stroke={node.isActive !== false ? 'hsl(var(--circuit-line))' : 'hsl(var(--circuit-line-inactive))'}
                strokeWidth="2"
                filter={node.isActive !== false ? "url(#glow)" : undefined}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                }}
                transition={{ 
                  duration: 0.4, 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
                className="node-pulse"
              />

              {/* Active pulse ring */}
              {node.isActive && !prefersReducedMotion && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r="30"
                  fill="none"
                  stroke="hsl(var(--circuit-line))"
                  strokeWidth="2"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ 
                    scale: [1, 1.5, 1.5],
                    opacity: [0.7, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}

              {/* Label */}
              <text
                x={x}
                y={y + 50}
                fill="hsl(var(--foreground))"
                fontSize="13"
                fontWeight="500"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {node.label.length > 15 ? node.label.slice(0, 15) + '...' : node.label}
              </text>

              {/* Status indicator */}
              {node.type === 'automation' && (
                <circle
                  cx={x + 20}
                  cy={y - 20}
                  r="6"
                  fill={node.isActive ? 'hsl(var(--circuit-line))' : 'hsl(var(--circuit-line-inactive))'}
                  className="led-indicator"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

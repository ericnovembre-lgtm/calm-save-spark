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

interface MoneyFlowGraphVerticalProps {
  automations: Array<{
    id: string;
    rule_name: string;
    is_active: boolean;
    action_config: { amount?: number };
  }>;
}

export function MoneyFlowGraphVertical({ automations }: MoneyFlowGraphVerticalProps) {
  const prefersReducedMotion = useReducedMotion();

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

  // Build vertical flow: Income → Automations → Destinations
  const nodes: FlowNode[] = [
    { id: 'income', label: 'Income', icon: Wallet, type: 'source' },
    ...automations.slice(0, 3).map(auto => ({
      id: auto.id,
      label: auto.rule_name,
      icon: TrendingUp,
      type: 'automation' as const,
      isActive: auto.is_active,
      amount: auto.action_config?.amount,
    })),
    { id: 'savings', label: 'Savings', icon: Target, type: 'destination' },
    { id: 'emergency', label: 'Emergency', icon: PiggyBank, type: 'destination' },
  ];

  return (
    <div className="circuit-board-container rounded-2xl p-6">
      <svg
        width="100%"
        height="600"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="verticalActiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--circuit-line))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--circuit-line))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--circuit-line))" stopOpacity="0.3" />
          </linearGradient>
          <filter id="verticalGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw vertical connections */}
        {nodes.map((node, idx) => {
          if (idx === 0 || node.type === 'destination') return null;
          
          const y1 = 80 + (idx - 1) * 120;
          const y2 = y1 + 100;
          const x = 200;

          return (
            <g key={`conn-${node.id}`}>
              <motion.line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={node.isActive ? 'url(#verticalActiveGradient)' : 'hsl(var(--circuit-line-inactive))'}
                strokeWidth="3"
                strokeDasharray={node.isActive ? "5,5" : "1,3"}
                filter={node.isActive ? "url(#verticalGlow)" : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: node.isActive ? 1 : 0.3 }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
              />
              
              {node.isActive && !prefersReducedMotion && (
                <motion.circle
                  cx={x}
                  cy={y1}
                  r="6"
                  fill="hsl(var(--circuit-line))"
                  filter="url(#verticalGlow)"
                  initial={{ cy: y1 }}
                  animate={{ cy: [y1, y2] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: idx * 0.3,
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Draw nodes */}
        {nodes.map((node, idx) => {
          const y = node.type === 'source' ? 50 : 
                    node.type === 'automation' ? 120 + (idx - 1) * 120 :
                    500 + (node.id === 'savings' ? 0 : 60);
          const x = 200;

          return (
            <g key={node.id}>
              <motion.circle
                cx={x}
                cy={y}
                r="35"
                fill="hsl(var(--circuit-bg))"
                stroke={node.isActive !== false ? 'hsl(var(--circuit-line))' : 'hsl(var(--circuit-line-inactive))'}
                strokeWidth="2"
                filter={node.isActive !== false ? "url(#verticalGlow)" : undefined}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: idx * 0.1,
                  type: "spring",
                }}
              />

              {node.isActive && !prefersReducedMotion && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r="35"
                  fill="none"
                  stroke="hsl(var(--circuit-line))"
                  strokeWidth="2"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ 
                    scale: [1, 1.4],
                    opacity: [0.7, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}

              <text
                x={x}
                y={y + 60}
                fill="hsl(var(--foreground))"
                fontSize="14"
                fontWeight="500"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {node.label.length > 12 ? node.label.slice(0, 12) + '...' : node.label}
              </text>

              {node.amount && (
                <text
                  x={x}
                  y={y + 75}
                  fill="hsl(var(--circuit-accent))"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  ${node.amount}
                </text>
              )}

              {node.type === 'automation' && (
                <circle
                  cx={x + 25}
                  cy={y - 25}
                  r="8"
                  fill={node.isActive ? 'hsl(var(--circuit-line))' : 'hsl(var(--circuit-line-inactive))'}
                  className="led-indicator"
                />
              )}
            </g>
          );
        })}
      </svg>

      {automations.length > 3 && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          Showing 3 of {automations.length} automations
        </p>
      )}
    </div>
  );
}

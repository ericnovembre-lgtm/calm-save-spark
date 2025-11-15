import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Connection {
  from: number;
  to: number;
  distance: number;
}

export const NeuralBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Generate nodes
    const nodeCount = 30;
    const initialNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
    }));

    setNodes(initialNodes);

    // Animate nodes
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(node => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Bounce off edges
          if (newX < 0 || newX > 100) newVx = -newVx;
          if (newY < 0 || newY > 100) newVy = -newVy;

          newX = Math.max(0, Math.min(100, newX));
          newY = Math.max(0, Math.min(100, newY));

          return { ...node, x: newX, y: newY, vx: newVx, vy: newVy };
        });

        // Calculate connections
        const newConnections: Connection[] = [];
        const maxDistance = 25;

        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[i].x - newNodes[j].x;
            const dy = newNodes[i].y - newNodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
              newConnections.push({
                from: i,
                to: j,
                distance,
              });
            }
          }
        }

        setConnections(newConnections);
        return newNodes;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Connections */}
        {connections.map((conn, i) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];
          const opacity = 1 - conn.distance / 25;

          return (
            <motion.line
              key={i}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity={opacity * 0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="3"
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: node.id * 0.1,
            }}
          />
        ))}

        {/* Data pulses along connections */}
        {connections.slice(0, 5).map((conn, i) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];

          return (
            <motion.circle
              key={`pulse-${i}`}
              r="2"
              fill="hsl(var(--chart-1))"
              initial={{
                cx: `${fromNode.x}%`,
                cy: `${fromNode.y}%`,
                opacity: 0,
              }}
              animate={{
                cx: `${toNode.x}%`,
                cy: `${toNode.y}%`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

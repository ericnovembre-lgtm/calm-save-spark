import { useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface FinancialHealthBackgroundProps {
  score?: number;
}

/**
 * Neural Health Mesh Background
 * Creates a living, breathing network of nodes that pulse like neurons
 * with a respiratory rhythm for calm, focused energy
 */
export const FinancialHealthBackground = ({ score = 50 }: FinancialHealthBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  // Get node color based on health score
  const getNodeColor = useCallback((score: number): string => {
    if (score >= 81) return '142, 71%, 45%'; // green
    if (score >= 61) return '217, 91%, 60%'; // blue
    if (score >= 41) return '45, 93%, 47%'; // yellow/amber
    return '0, 72%, 51%'; // red
  }, []);

  // Initialize nodes
  const initNodes = useCallback((width: number, height: number) => {
    const nodeCount = Math.min(60, Math.max(30, Math.floor((width * height) / 25000)));
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 2 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    return nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      nodesRef.current = initNodes(rect.width, rect.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (prefersReducedMotion) {
      // Static render for reduced motion
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
      const nodeColor = getNodeColor(score);

      ctx.clearRect(0, 0, width, height);

      // Draw static connections
      const connectionDistance = 120;
      nodesRef.current.forEach((node, i) => {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const other = nodesRef.current[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${nodeColor}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // Draw static nodes
      nodesRef.current.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${nodeColor}, 0.4)`;
        ctx.fill();
      });

      return () => window.removeEventListener('resize', resizeCanvas);
    }

    let time = 0;
    const animate = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
      const nodeColor = getNodeColor(score);

      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Move nodes slowly
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));

        // Update pulse
        node.pulsePhase += node.pulseSpeed;
      });

      // Draw connections
      const connectionDistance = 150;
      nodesRef.current.forEach((node, i) => {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const other = nodesRef.current[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.12;
            const pulseStrength = (Math.sin(node.pulsePhase) + Math.sin(other.pulsePhase)) * 0.5;
            const finalOpacity = opacity * (0.8 + pulseStrength * 0.2);

            ctx.beginPath();
            ctx.strokeStyle = `hsla(${nodeColor}, ${finalOpacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // Draw nodes with pulse effect
      nodesRef.current.forEach((node) => {
        const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.3;
        const pulseOpacity = 0.3 + Math.sin(node.pulsePhase) * 0.2;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * pulseScale * 3
        );
        gradient.addColorStop(0, `hsla(${nodeColor}, ${pulseOpacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${nodeColor}, 0)`);

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseScale * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${nodeColor}, ${pulseOpacity + 0.2})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [score, prefersReducedMotion, getNodeColor, initNodes]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      animate={
        prefersReducedMotion
          ? {}
          : {
              scale: [1, 1.015, 1],
            }
      }
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: 0.6 }}
      />
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40" />
    </motion.div>
  );
};

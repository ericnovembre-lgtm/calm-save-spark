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
  baseX: number;
  baseY: number;
}

interface FinancialHealthBackgroundProps {
  score?: number;
}

/**
 * Neural Health Mesh Background
 * Creates a living, breathing network of nodes that pulse like neurons
 * with a respiratory rhythm for calm, focused energy
 * Nodes glow brighter when the mouse hovers near them (responsive organism effect)
 */
export const FinancialHealthBackground = ({ score = 50 }: FinancialHealthBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
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
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 2 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    return nodes;
  }, []);

  // Handle mouse move for proximity effects
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion]);

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

    const animate = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
      const nodeColor = getNodeColor(score);
      const mouse = mouseRef.current;
      const influenceRadius = 120;

      ctx.clearRect(0, 0, width, height);

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Calculate proximity to mouse
        let proximity = 0;
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const mouseDistance = Math.sqrt(dx * dx + dy * dy);
          proximity = Math.max(0, 1 - mouseDistance / influenceRadius);
          
          // Attraction effect - nodes gently reach toward cursor
          if (proximity > 0) {
            const attractionStrength = proximity * 0.15;
            const targetX = node.baseX + (mouse.x - node.baseX) * attractionStrength;
            const targetY = node.baseY + (mouse.y - node.baseY) * attractionStrength;
            node.x += (targetX - node.x) * 0.08;
            node.y += (targetY - node.y) * 0.08;
          } else {
            // Return to natural movement
            node.x += (node.baseX - node.x) * 0.02;
            node.y += (node.baseY - node.y) * 0.02;
          }
        }

        // Move base position slowly
        node.baseX += node.vx;
        node.baseY += node.vy;

        // Bounce off edges
        if (node.baseX < 0 || node.baseX > width) node.vx *= -1;
        if (node.baseY < 0 || node.baseY > height) node.vy *= -1;

        // Keep in bounds
        node.baseX = Math.max(0, Math.min(width, node.baseX));
        node.baseY = Math.max(0, Math.min(height, node.baseY));

        // Update actual position for non-hovered nodes
        if (!mouse.active || proximity === 0) {
          node.x = node.baseX;
          node.y = node.baseY;
        }

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
            // Calculate connection proximity to mouse
            let connectionProximity = 0;
            if (mouse.active) {
              const midX = (node.x + other.x) / 2;
              const midY = (node.y + other.y) / 2;
              const mouseDist = Math.sqrt(
                Math.pow(midX - mouse.x, 2) + Math.pow(midY - mouse.y, 2)
              );
              connectionProximity = Math.max(0, 1 - mouseDist / influenceRadius);
            }

            const baseOpacity = (1 - dist / connectionDistance) * 0.12;
            const pulseStrength = (Math.sin(node.pulsePhase) + Math.sin(other.pulsePhase)) * 0.5;
            
            // Boost opacity based on mouse proximity
            const hoverBoost = connectionProximity * 0.25;
            const finalOpacity = (baseOpacity * (0.8 + pulseStrength * 0.2)) + hoverBoost;
            
            // Thicker lines near cursor
            const lineWidth = 1 + connectionProximity * 1.5;

            ctx.beginPath();
            ctx.strokeStyle = `hsla(${nodeColor}, ${Math.min(finalOpacity, 0.5)})`;
            ctx.lineWidth = lineWidth;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // Draw nodes with pulse effect and proximity glow
      nodesRef.current.forEach((node) => {
        // Calculate proximity to mouse for glow amplification
        let proximity = 0;
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const mouseDistance = Math.sqrt(dx * dx + dy * dy);
          proximity = Math.max(0, 1 - mouseDistance / influenceRadius);
        }

        const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.3;
        const basePulseOpacity = 0.3 + Math.sin(node.pulsePhase) * 0.2;
        
        // Amplify based on mouse proximity (up to 60% brighter)
        const hoverBoost = proximity * 0.6;
        const pulseOpacity = basePulseOpacity + hoverBoost;
        
        // Expand glow radius near cursor (up to 2.5x)
        const glowMultiplier = 1 + proximity * 1.5;

        // Outer glow - larger and brighter when hovered
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * pulseScale * 3 * glowMultiplier
        );
        gradient.addColorStop(0, `hsla(${nodeColor}, ${pulseOpacity * 0.6})`);
        gradient.addColorStop(0.5, `hsla(${nodeColor}, ${pulseOpacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${nodeColor}, 0)`);

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseScale * 3 * glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core - brighter when hovered
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseScale * (1 + proximity * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${nodeColor}, ${Math.min(pulseOpacity + 0.2, 0.95)})`;
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
      className="fixed inset-0 z-0 overflow-hidden"
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
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40 pointer-events-none" />
    </motion.div>
  );
};

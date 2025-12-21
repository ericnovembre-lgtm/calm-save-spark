import { useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { haptics } from '@/lib/haptics';

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
 * Nodes glow brighter when the mouse/touch hovers near them (responsive organism effect)
 * Includes haptic feedback on mobile for tactile 'neural pulse' sensation
 */
export const FinancialHealthBackground = ({ score = 50 }: FinancialHealthBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const prefersReducedMotion = useReducedMotion();
  
  // Haptic feedback debouncing refs
  const lastHapticTimeRef = useRef<number>(0);
  const lastHapticNodeRef = useRef<number | null>(null);
  const hapticProximityRef = useRef<number>(0);

  // Get node color based on health score - using brand-aligned warm gold/beige
  // Modulates brightness based on score for visual hierarchy
  const getNodeColor = useCallback((score: number): string => {
    // Brand accent: 38 45% 68% (warm gold/beige)
    // Higher scores = brighter, more saturated gold
    if (score >= 81) return '38, 55%, 72%'; // bright gold
    if (score >= 61) return '38, 45%, 68%'; // standard accent
    if (score >= 41) return '38, 35%, 58%'; // muted beige
    return '38, 25%, 48%'; // dim beige
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

  // Trigger haptic feedback for neural pulse sensation
  const triggerNeuralHaptic = useCallback((proximity: number, nodeIndex: number) => {
    if (prefersReducedMotion) return;
    
    const now = Date.now();
    const isNewNode = lastHapticNodeRef.current !== nodeIndex;
    const timeSinceLastHaptic = now - lastHapticTimeRef.current;
    
    // Debounce based on proximity strength
    const minDebounce = proximity > 0.8 ? 200 : 150;
    
    if (timeSinceLastHaptic < minDebounce) return;
    
    // Strong proximity (center of node) = medium pulse
    if (proximity > 0.75 && isNewNode) {
      haptics.vibrate('medium');
      lastHapticTimeRef.current = now;
      lastHapticNodeRef.current = nodeIndex;
    } 
    // Moderate proximity with new node = light pulse
    else if (proximity > 0.5 && isNewNode) {
      haptics.vibrate('light');
      lastHapticTimeRef.current = now;
      lastHapticNodeRef.current = nodeIndex;
    }
    // Very strong proximity = custom neural pulse pattern
    else if (proximity > 0.9 && timeSinceLastHaptic > 400) {
      // Subtle "synapse firing" pattern: short-pause-shorter
      haptics.custom([8, 30, 5]);
      lastHapticTimeRef.current = now;
    }
  }, [prefersReducedMotion]);

  // Handle mouse/touch events for proximity effects
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const updatePointerPosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        active: true,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePointerPosition(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerPosition(touch.clientX, touch.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerPosition(touch.clientX, touch.clientY);
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      lastHapticNodeRef.current = null;
      hapticProximityRef.current = 0;
    };

    // Mouse events
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handlePointerLeave);
    
    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handlePointerLeave);
    canvas.addEventListener('touchcancel', handlePointerLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handlePointerLeave);
      canvas.removeEventListener('touchcancel', handlePointerLeave);
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

      // Find closest node to pointer for haptic feedback
      let closestNodeIndex: number | null = null;
      let closestProximity = 0;

      if (mouse.active) {
        nodesRef.current.forEach((node, index) => {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - distance / influenceRadius);
          
          if (proximity > closestProximity) {
            closestProximity = proximity;
            closestNodeIndex = index;
          }
        });

        // Trigger haptic for closest node only (prevents excessive feedback)
        if (closestProximity > 0.4 && closestNodeIndex !== null) {
          triggerNeuralHaptic(closestProximity, closestNodeIndex);
        }
        
        hapticProximityRef.current = closestProximity;
      }

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
  }, [score, prefersReducedMotion, getNodeColor, initNodes, triggerNeuralHaptic]);

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

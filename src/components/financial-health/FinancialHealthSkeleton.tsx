import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card } from '@/components/ui/card';

/**
 * Simplified Neural Mesh for skeleton background
 * Lighter weight version with fewer nodes
 */
const NeuralSkeletonBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Generate fewer nodes for skeleton
    const nodeCount = 20;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      phase: Math.random() * Math.PI * 2,
    }));

    if (prefersReducedMotion) {
      // Static render
      ctx.fillStyle = 'hsla(var(--muted), 0.1)';
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw pulsing nodes
      nodes.forEach(node => {
        node.phase += 0.02;
        const pulse = 0.3 + Math.sin(node.phase) * 0.2;

        // Draw connection lines to nearby nodes
        nodes.forEach(other => {
          const dist = Math.sqrt(Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2));
          if (dist < 150 && dist > 0) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(217, 91%, 60%, ${(1 - dist / 150) * 0.08})`;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        // Draw node glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
        gradient.addColorStop(0, `hsla(217, 91%, 60%, ${pulse * 0.3})`);
        gradient.addColorStop(1, 'hsla(217, 91%, 60%, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217, 91%, 60%, ${pulse + 0.2})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40"
    />
  );
};

/**
 * Nucleus Skeleton - Rotating rings placeholder for the globe
 */
const NucleusSkeleton = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Card className="relative p-8 overflow-hidden bg-card/30 backdrop-blur-sm border-border/30">
      <div className="flex items-center justify-center h-[400px]">
        <div className="relative w-64 h-64">
          {/* Rotating electron rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-dashed"
              style={{
                borderColor: `hsla(217, 91%, 60%, ${0.2 - i * 0.05})`,
                transform: `rotateX(${60 + i * 20}deg) rotateY(${i * 30}deg)`,
              }}
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}

          {/* Pulsing center nucleus */}
          <motion.div
            className="absolute inset-0 m-auto w-24 h-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(217, 91%, 60%, 0.3) 0%, hsla(217, 91%, 60%, 0) 70%)',
            }}
            animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Score placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-16 h-8 rounded bg-muted/50"
              animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

/**
 * EKG Pulse Stream Skeleton - Animated flatline with subtle pulse
 */
const PulseStreamSkeleton = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Card className="relative p-6 overflow-hidden bg-card/30 backdrop-blur-sm border-border/30">
      <div className="h-[300px] relative">
        {/* EKG line container */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsla(217, 91%, 60%, 0)" />
              <stop offset="50%" stopColor="hsla(217, 91%, 60%, 0.6)" />
              <stop offset="100%" stopColor="hsla(217, 91%, 60%, 0)" />
            </linearGradient>
            <linearGradient id="liquidFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsla(217, 91%, 60%, 0.15)" />
              <stop offset="100%" stopColor="hsla(217, 91%, 60%, 0)" />
            </linearGradient>
          </defs>

          {/* Liquid fill area */}
          <motion.rect
            x="0"
            y="150"
            width="100%"
            height="150"
            fill="url(#liquidFill)"
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Animated EKG pulse line */}
          <motion.line
            x1="0"
            y1="150"
            x2="100%"
            y2="150"
            stroke="url(#ekgGradient)"
            strokeWidth="2"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y1: [150, 140, 150, 160, 150],
                    y2: [150, 160, 150, 140, 150],
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Scanning pulse */}
          {!prefersReducedMotion && (
            <motion.rect
              x="-20%"
              y="0"
              width="20%"
              height="100%"
              fill="url(#ekgGradient)"
              animate={{ x: ['-20%', '120%'] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </svg>

        {/* Chart labels skeleton */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-12 h-3 rounded bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    </Card>
  );
};

/**
 * Glass-styled diagnostic card skeleton with scan beam
 */
const DiagnosticCardSkeleton = ({ index }: { index: number }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative p-6 h-48 overflow-hidden bg-card/20 backdrop-blur-md border-white/10">
        {/* Scan beam effect */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 w-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsla(217, 91%, 60%, 0.1) 50%, transparent 100%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeOut',
            }}
          />
        )}

        {/* Neural node pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <pattern id={`nodePattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="hsla(217, 91%, 60%, 0.5)" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#nodePattern-${index})`} />
          </svg>
        </div>

        {/* Card content skeleton */}
        <div className="relative z-10 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <motion.div
              className="h-12 w-12 rounded-xl bg-muted/40"
              animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
            />
            <motion.div
              className="h-8 w-16 rounded bg-muted/40"
              animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 + 0.1 }}
            />
          </div>

          {/* Text lines */}
          <div className="space-y-2">
            <motion.div
              className="h-4 w-3/4 rounded bg-muted/30"
              animate={prefersReducedMotion ? {} : { opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 + 0.2 }}
            />
            <motion.div
              className="h-6 w-1/2 rounded bg-muted/30"
              animate={prefersReducedMotion ? {} : { opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 + 0.3 }}
            />
          </div>

          {/* Progress bar */}
          <motion.div
            className="h-2 w-full rounded-full bg-muted/20 overflow-hidden"
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsla(217, 91%, 60%, 0.3), hsla(217, 91%, 60%, 0.5))',
              }}
              animate={prefersReducedMotion ? { width: '60%' } : { width: ['0%', '70%', '60%'] }}
              transition={{ duration: 1.5, delay: index * 0.2 + 0.5 }}
            />
          </motion.div>
        </div>

        {/* Glass edge highlight */}
        <div className="absolute inset-0 rounded-lg border border-white/5 pointer-events-none" />
      </Card>
    </motion.div>
  );
};

/**
 * Header skeleton with breathing text placeholders
 */
const HeaderSkeleton = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="text-center space-y-4">
      <motion.div
        className="h-12 w-3/4 mx-auto rounded-lg"
        style={{
          background: 'linear-gradient(90deg, hsla(217, 91%, 60%, 0.1), hsla(217, 91%, 60%, 0.2), hsla(217, 91%, 60%, 0.1))',
        }}
        animate={prefersReducedMotion ? {} : { opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="h-6 w-1/2 mx-auto rounded-lg bg-muted/30"
        animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
    </div>
  );
};

/**
 * Bio-Digital themed skeleton loader for Financial Health page
 * Maintains the neural mesh aesthetic during loading states
 */
export const FinancialHealthSkeleton = () => {
  return (
    <div className="relative min-h-screen">
      {/* Neural mesh background (simplified, lighter) */}
      <NeuralSkeletonBackground />

      <div className="container mx-auto px-4 py-12 space-y-16 max-w-7xl relative z-10">
        {/* Header with breathing text placeholders */}
        <HeaderSkeleton />

        {/* Living Nucleus placeholder */}
        <NucleusSkeleton />

        {/* EKG Chart placeholder */}
        <PulseStreamSkeleton />

        {/* Diagnostic card grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <DiagnosticCardSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

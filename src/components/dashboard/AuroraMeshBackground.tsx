import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ScanlineOverlay } from '@/components/effects/ScanlineOverlay';
import { ParticleField } from '@/components/effects/ParticleField';

interface AuroraMeshBackgroundProps {
  netWorthChangePercent: number;
  enableScanlines?: boolean;
  enableParticles?: boolean;
  enableBreathing?: boolean;
  enableGrid?: boolean;
}

/**
 * Living Aurora Mesh Background - Enhanced Cinematic Version
 * Animated mesh gradients that respond to financial sentiment
 * Green/Teal = Gains | Rose/Orange = Losses | Purple/Accent = Neutral
 * 
 * New features: scanlines, particles, breathing effect, grid overlay
 */
export function AuroraMeshBackground({ 
  netWorthChangePercent,
  enableScanlines = true,
  enableParticles = true,
  enableBreathing = true,
  enableGrid = true,
}: AuroraMeshBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth spring for position animation
  const progress = useSpring(0, { stiffness: 20, damping: 15 });

  // Breathing effect scale
  const breathingProgress = useSpring(0, { stiffness: 10, damping: 20 });
  const breathingScale = useTransform(breathingProgress, (p) => 1 + Math.sin(p) * 0.02);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const animate = () => {
      progress.set(progress.get() + 0.001);
      if (enableBreathing) {
        breathingProgress.set(breathingProgress.get() + 0.02);
      }
      requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [progress, breathingProgress, prefersReducedMotion, enableBreathing]);

  // Transform progress into position values
  const x1 = useTransform(progress, (p) => 20 + Math.sin(p * Math.PI * 2) * 15);
  const y1 = useTransform(progress, (p) => 20 + Math.cos(p * Math.PI * 2) * 10);
  const x2 = useTransform(progress, (p) => 80 + Math.cos(p * Math.PI * 2) * 15);
  const y2 = useTransform(progress, (p) => 30 + Math.sin(p * Math.PI * 2) * 10);
  const x3 = useTransform(progress, (p) => 50 + Math.sin(p * Math.PI * 2 + 1) * 20);
  const y3 = useTransform(progress, (p) => 80 + Math.cos(p * Math.PI * 2 + 1) * 15);

  // Determine colors and particle settings based on sentiment
  // Brand-aligned: warm greens/teals for positive, amber/orange for negative, beige/gold for neutral
  const getSentimentConfig = (change: number) => {
    if (change > 5) {
      // Strong positive: Warm teal/emerald with beige undertones
      return {
        colors: {
          color1: 'hsl(152, 50%, 45%)',
          color2: 'hsl(160, 45%, 50%)',
          color3: 'hsl(142, 40%, 50%)',
          glow: 'hsla(152, 50%, 45%, 0.12)',
        },
        particleColor: '152 50% 45%',
        particleDirection: 'up' as const,
        particleSpeed: 'normal' as const,
      };
    } else if (change > 0) {
      // Mild positive: Soft warm green
      return {
        colors: {
          color1: 'hsl(142, 40%, 55%)',
          color2: 'hsl(150, 35%, 55%)',
          color3: 'hsl(145, 30%, 55%)',
          glow: 'hsla(142, 40%, 55%, 0.08)',
        },
        particleColor: '142 40% 55%',
        particleDirection: 'up' as const,
        particleSpeed: 'slow' as const,
      };
    } else if (change < -5) {
      // Strong negative: Muted amber/orange (not harsh red)
      return {
        colors: {
          color1: 'hsl(25, 70%, 50%)',
          color2: 'hsl(30, 65%, 55%)',
          color3: 'hsl(20, 60%, 50%)',
          glow: 'hsla(25, 70%, 50%, 0.12)',
        },
        particleColor: '25 70% 50%',
        particleDirection: 'down' as const,
        particleSpeed: 'slow' as const,
      };
    } else if (change < 0) {
      // Mild negative: Soft amber
      return {
        colors: {
          color1: 'hsl(38, 55%, 55%)',
          color2: 'hsl(35, 50%, 58%)',
          color3: 'hsl(40, 45%, 55%)',
          glow: 'hsla(38, 55%, 55%, 0.08)',
        },
        particleColor: '38 55% 55%',
        particleDirection: 'random' as const,
        particleSpeed: 'slow' as const,
      };
    }
    // Neutral: Brand beige/gold palette
    return {
      colors: {
        color1: 'hsl(40, 35%, 85%)',
        color2: 'hsl(38, 45%, 68%)',
        color3: 'hsl(40, 25%, 75%)',
        glow: 'hsla(40, 35%, 85%, 0.1)',
      },
      particleColor: '40 35% 70%',
      particleDirection: 'random' as const,
      particleSpeed: 'slow' as const,
    };
  };

  const config = getSentimentConfig(netWorthChangePercent);
  const { colors } = config;

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient layer with breathing */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          scale: enableBreathing && !prefersReducedMotion ? breathingScale : 1,
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, ${colors.glow}, transparent),
            radial-gradient(ellipse 60% 40% at 0% 100%, ${colors.glow}, transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, ${colors.glow}, transparent),
            hsl(var(--background))
          `,
        }}
      />

      {/* Animated mesh gradient blobs */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ filter: 'blur(40px)' }}
      >
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </filter>
        </defs>

        <g filter="url(#gooey)" opacity="0.5">
          <motion.circle
            cx={prefersReducedMotion ? 20 : x1}
            cy={prefersReducedMotion ? 20 : y1}
            r="25"
            fill={colors.color1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2 }}
          />
          <motion.circle
            cx={prefersReducedMotion ? 80 : x2}
            cy={prefersReducedMotion ? 30 : y2}
            r="30"
            fill={colors.color2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 2, delay: 0.3 }}
          />
          <motion.circle
            cx={prefersReducedMotion ? 50 : x3}
            cy={prefersReducedMotion ? 80 : y3}
            r="20"
            fill={colors.color3}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 2, delay: 0.6 }}
          />
        </g>
      </svg>

      {/* Grid overlay for cyberpunk aesthetic */}
      {enableGrid && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsla(var(--foreground) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsla(var(--foreground) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Floating particles */}
      {enableParticles && (
        <ParticleField
          count={25}
          color={config.particleColor}
          direction={config.particleDirection}
          speed={config.particleSpeed}
          minSize={1}
          maxSize={3}
        />
      )}

      {/* Scanline effect */}
      {enableScanlines && (
        <ScanlineOverlay
          intensity={0.02}
          speed={10}
          className="absolute inset-0"
        />
      )}

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.3) 100%)',
        }}
      />
    </div>
  );
}

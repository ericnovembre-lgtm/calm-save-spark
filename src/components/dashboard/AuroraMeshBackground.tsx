import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AuroraMeshBackgroundProps {
  netWorthChangePercent: number;
}

/**
 * Living Aurora Mesh Background
 * Animated mesh gradients that respond to financial sentiment
 * Green/Teal = Gains | Rose/Orange = Losses | Purple/Accent = Neutral
 */
export function AuroraMeshBackground({ netWorthChangePercent }: AuroraMeshBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth spring for position animation
  const progress = useSpring(0, { stiffness: 20, damping: 15 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const animate = () => {
      progress.set(progress.get() + 0.001);
      requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [progress, prefersReducedMotion]);

  // Transform progress into position values
  const x1 = useTransform(progress, (p) => 20 + Math.sin(p * Math.PI * 2) * 15);
  const y1 = useTransform(progress, (p) => 20 + Math.cos(p * Math.PI * 2) * 10);
  const x2 = useTransform(progress, (p) => 80 + Math.cos(p * Math.PI * 2) * 15);
  const y2 = useTransform(progress, (p) => 30 + Math.sin(p * Math.PI * 2) * 10);
  const x3 = useTransform(progress, (p) => 50 + Math.sin(p * Math.PI * 2 + 1) * 20);
  const y3 = useTransform(progress, (p) => 80 + Math.cos(p * Math.PI * 2 + 1) * 15);

  // Determine colors based on sentiment
  const getSentimentColors = (change: number) => {
    if (change > 5) {
      // Strong positive: Teal/Emerald gradient
      return {
        color1: 'hsl(160, 84%, 39%)', // Emerald
        color2: 'hsl(172, 66%, 50%)', // Teal
        color3: 'hsl(142, 71%, 45%)', // Green
        glow: 'hsla(160, 84%, 39%, 0.15)',
      };
    } else if (change > 0) {
      // Mild positive: Soft green/blue
      return {
        color1: 'hsl(142, 50%, 50%)',
        color2: 'hsl(172, 50%, 50%)',
        color3: 'hsl(160, 40%, 50%)',
        glow: 'hsla(142, 50%, 50%, 0.1)',
      };
    } else if (change < -5) {
      // Strong negative: Rose/Orange gradient
      return {
        color1: 'hsl(0, 72%, 51%)', // Red
        color2: 'hsl(25, 95%, 53%)', // Orange
        color3: 'hsl(350, 80%, 55%)', // Rose
        glow: 'hsla(0, 72%, 51%, 0.15)',
      };
    } else if (change < 0) {
      // Mild negative: Soft amber/orange
      return {
        color1: 'hsl(38, 92%, 50%)',
        color2: 'hsl(25, 80%, 55%)',
        color3: 'hsl(45, 70%, 50%)',
        glow: 'hsla(38, 92%, 50%, 0.1)',
      };
    }
    // Neutral: Purple/Accent (brand colors)
    return {
      color1: 'hsl(var(--accent))',
      color2: 'hsl(var(--secondary))',
      color3: 'hsl(var(--primary) / 0.3)',
      glow: 'hsla(var(--accent) / 0.1)',
    };
  };

  const colors = getSentimentColors(netWorthChangePercent);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient layer */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
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

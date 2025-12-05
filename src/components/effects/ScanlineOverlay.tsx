import { motion, useReducedMotion } from 'framer-motion';

interface ScanlineOverlayProps {
  intensity?: number; // 0-1
  speed?: number; // seconds per scan
  className?: string;
}

/**
 * ScanlineOverlay - CRT-style scanline effect
 * Creates subtle horizontal lines that move vertically
 */
export function ScanlineOverlay({
  intensity = 0.03,
  speed = 8,
  className,
}: ScanlineOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={`pointer-events-none ${className || ''}`}>
      {/* Static scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            hsla(var(--foreground) / ${intensity}) 2px,
            hsla(var(--foreground) / ${intensity}) 4px
          )`,
          backgroundSize: '100% 4px',
        }}
      />

      {/* Moving scan beam */}
      <motion.div
        className="absolute inset-x-0 h-[2px]"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            hsla(var(--primary) / 0.1) 50%,
            transparent 100%
          )`,
          boxShadow: '0 0 20px 5px hsla(var(--primary) / 0.05)',
        }}
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

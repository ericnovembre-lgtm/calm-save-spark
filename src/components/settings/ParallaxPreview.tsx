import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface ParallaxPreviewProps {
  disabled?: boolean;
}

// Mini orbs for the preview
const PREVIEW_ORBS = [
  { id: 1, size: 32, x: '20%', y: '30%', color: 'hsl(var(--aurora-orb-accent))', parallaxStrength: 0.8 },
  { id: 2, size: 24, x: '70%', y: '25%', color: 'hsl(var(--aurora-orb-primary))', parallaxStrength: 1.0 },
  { id: 3, size: 40, x: '50%', y: '65%', color: 'hsl(var(--aurora-orb-secondary))', parallaxStrength: 0.5 },
];

const MAX_OFFSET = 12;

/**
 * Interactive parallax preview for accessibility settings
 * Shows mini floating orbs that respond to mouse movement
 */
export function ParallaxPreview({ disabled = false }: ParallaxPreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || prefersReducedMotion;

  // Motion values for mouse position (0-1 range)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth spring physics
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Spring back to center
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div
      className={cn(
        "relative w-full h-24 rounded-xl overflow-hidden",
        "bg-gradient-to-br from-black/30 to-black/50",
        "border border-white/10",
        "transition-opacity duration-300",
        isDisabled && "opacity-40 pointer-events-none"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      {/* Orbs with parallax */}
      {PREVIEW_ORBS.map((orb) => (
        <PreviewOrb
          key={orb.id}
          orb={orb}
          smoothX={smoothX}
          smoothY={smoothY}
          isDisabled={isDisabled}
        />
      ))}

      {/* Hint text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs text-muted-foreground/60">
          {isDisabled ? 'Preview disabled' : 'Move mouse to preview'}
        </span>
      </div>
    </div>
  );
}

interface PreviewOrbProps {
  orb: typeof PREVIEW_ORBS[0];
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
  isDisabled: boolean;
}

function PreviewOrb({ orb, smoothX, smoothY, isDisabled }: PreviewOrbProps) {
  // Calculate parallax offset for this orb
  const offsetX = useTransform(
    smoothX,
    [0, 1],
    [-MAX_OFFSET * orb.parallaxStrength, MAX_OFFSET * orb.parallaxStrength]
  );
  const offsetY = useTransform(
    smoothY,
    [0, 1],
    [-MAX_OFFSET * orb.parallaxStrength, MAX_OFFSET * orb.parallaxStrength]
  );

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: orb.size,
        height: orb.size,
        left: orb.x,
        top: orb.y,
        x: isDisabled ? 0 : offsetX,
        y: isDisabled ? 0 : offsetY,
        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
        filter: 'blur(8px)',
        opacity: 0.7,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

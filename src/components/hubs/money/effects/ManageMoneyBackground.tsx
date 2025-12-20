import { useEffect, useRef, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ManageMoneyBackground - "Digital Topography" Effect
 * 
 * Creates flowing grid lines that undulate like a landscape,
 * symbolizing cash flow and forward momentum.
 */
export function ManageMoneyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  // Get CSS variable color - reduced opacity for subtlety
  const primaryColor = useMemo(() => {
    if (typeof window === 'undefined') return 'rgba(100, 100, 100, 0.04)';
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const primaryHsl = computedStyle.getPropertyValue('--primary').trim();
    if (primaryHsl) {
      // Parse HSL and return with low opacity
      return `hsl(${primaryHsl} / 0.04)`;
    }
    return 'rgba(100, 100, 100, 0.04)';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const lineCount = 18;
    const verticalPulseInterval = 5000; // ms between pulses

    // Handle resize
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    const animate = () => {
      if (prefersReducedMotion) {
        // Static grid for reduced motion
        drawStaticGrid(ctx, canvas.width, canvas.height, lineCount, primaryColor);
        return;
      }

      time += 16; // ~60fps
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = window.innerWidth;
      const height = window.innerHeight;
      const lineSpacing = height / (lineCount + 1);

      // Draw flowing horizontal lines
      for (let i = 1; i <= lineCount; i++) {
        const baseY = lineSpacing * i;
        const amplitude = 8 + Math.sin(i * 0.5) * 4;
        const frequency = 0.003 + (i % 3) * 0.001;
        const speed = 0.0008;

        ctx.beginPath();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1;

        for (let x = 0; x <= width; x += 3) {
          const y = baseY + 
            Math.sin((x * frequency) + (time * speed) + i) * amplitude +
            Math.sin((x * frequency * 2) + (time * speed * 0.5)) * (amplitude * 0.3);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical pulse lines
      const pulseProgress = (time % verticalPulseInterval) / verticalPulseInterval;
      const pulseX = pulseProgress * (width + 200) - 100;
      
      if (pulseProgress > 0 && pulseProgress < 1) {
        const gradient = ctx.createLinearGradient(pulseX - 50, 0, pulseX + 50, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, primaryColor.replace('0.08', '0.15'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(pulseX - 50, 0, 100, height);
      }

      // Draw subtle vertical grid lines
      const verticalLineCount = Math.ceil(width / 80);
      ctx.strokeStyle = primaryColor.replace('0.04', '0.02');
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= verticalLineCount; i++) {
        const x = i * 80;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [primaryColor, prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ transform: 'translate3d(0, 0, 0)' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        aria-hidden="true"
      />
      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30"
        aria-hidden="true"
      />
    </motion.div>
  );
}

// Static grid fallback for reduced motion
function drawStaticGrid(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  lineCount: number,
  color: string
) {
  const lineSpacing = height / (lineCount + 1);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let i = 1; i <= lineCount; i++) {
    ctx.beginPath();
    ctx.moveTo(0, lineSpacing * i);
    ctx.lineTo(width, lineSpacing * i);
    ctx.stroke();
  }

  // Vertical lines
  const verticalLineCount = Math.ceil(width / 80);
  ctx.strokeStyle = color.replace('0.04', '0.02');
  ctx.lineWidth = 0.5;

  for (let i = 0; i <= verticalLineCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 80, 0);
    ctx.lineTo(i * 80, height);
    ctx.stroke();
  }
}

export default ManageMoneyBackground;

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  life: number;
  hue: number;
  isCurrency?: boolean;
  emoji?: string;
}

const CURRENCY_EMOJIS = ['💰', '💳', '📈', '💵', '💎', '🪙'];

/**
 * Enhanced particle system with advanced interactions
 * - Reacts to mouse position (attraction/repulsion)
 * - Responds to scroll velocity
 * - Click burst effects
 * - Floating currency symbols with physics
 */
export const EnhancedParticles = () => {
  const prefersReducedMotion = useReducedMotion();
  const { preferences } = useMotionPreferences();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, velocity: { x: 0, y: 0 } });
  const lastMouseRef = useRef({ x: 0, y: 0, time: Date.now() });
  const scrollVelocityRef = useRef(0);
  const lastScrollRef = useRef({ y: 0, time: Date.now() });
  const animationFrameRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(true);
  
  const fpsRef = useRef({ 
    frames: 0, 
    lastTime: performance.now(), 
    fps: 60,
    targetParticleCount: 50,
    lastAdjustment: performance.now()
  });

  useEffect(() => {
    if (prefersReducedMotion || !preferences.particles) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const createParticle = (x?: number, y?: number, burst = false, isCurrency = false): Particle => ({
      x: x ?? Math.random() * canvas.width,
      y: y ?? (burst ? y : canvas.height + 10),
      size: isCurrency ? Math.random() * 12 + 8 : Math.random() * (burst ? 5 : 3) + (burst ? 2 : 1),
      speedY: burst ? (Math.random() - 0.5) * 4 : -(Math.random() * 1.8 + 0.6),
      speedX: (Math.random() - 0.5) * (burst ? 3 : 1),
      opacity: isCurrency ? 0.8 : Math.random() * 0.6 + (burst ? 0.4 : 0.2),
      life: isCurrency ? 400 : Math.random() * (burst ? 150 : 250) + (burst ? 50 : 100),
      hue: Math.random() * 40 + 30, // Golden hues
      isCurrency,
      emoji: isCurrency ? CURRENCY_EMOJIS[Math.floor(Math.random() * CURRENCY_EMOJIS.length)] : undefined,
    });

    const initParticles = (count?: number) => {
      particlesRef.current = [];
      const particleCount = count || fpsRef.current.targetParticleCount;
      for (let i = 0; i < particleCount; i++) {
        const isCurrency = Math.random() < 0.15; // 15% currency symbols
        particlesRef.current.push(createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          false,
          isCurrency
        ));
      }
    };
    
    initParticles();

    // Track mouse velocity
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastMouseRef.current.time;
      
      if (dt > 0) {
        const vx = (e.clientX - lastMouseRef.current.x) / dt;
        const vy = (e.clientY - lastMouseRef.current.y) / dt;
        mouseRef.current.velocity = { x: vx * 100, y: vy * 100 };
      }
      
      mouseRef.current = { x: e.clientX, y: e.clientY, velocity: mouseRef.current.velocity };
      lastMouseRef.current = { x: e.clientX, y: e.clientY, time: now };
      
      // Enhanced particle trail
      if (Math.random() < 0.2) {
        particlesRef.current.push(
          createParticle(
            e.clientX + (Math.random() - 0.5) * 80,
            e.clientY + (Math.random() - 0.5) * 80,
            true
          )
        );
      }
    };

    // Track scroll velocity
    const handleScroll = () => {
      const now = Date.now();
      const dt = now - lastScrollRef.current.time;
      
      if (dt > 0) {
        const velocity = (window.scrollY - lastScrollRef.current.y) / dt;
        scrollVelocityRef.current = velocity * 100;
      }
      
      lastScrollRef.current = { y: window.scrollY, time: now };
    };

    // Enhanced click burst with radial pattern
    const handleClick = (e: MouseEvent) => {
      // Radial burst
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = Math.random() * 4 + 2;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 6 + 3,
          speedY: Math.sin(angle) * speed,
          speedX: Math.cos(angle) * speed,
          opacity: 0.9,
          life: 100,
          hue: Math.random() * 40 + 30,
        });
      }
      
      // Add currency symbols in burst
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push(
          createParticle(
            e.clientX + (Math.random() - 0.5) * 120,
            e.clientY + (Math.random() - 0.5) * 120,
            true,
            true
          )
        );
      }
    };

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    canvas.addEventListener("click", handleClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = () => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const currentTime = performance.now();
      fpsRef.current.frames++;
      
      if (currentTime >= fpsRef.current.lastTime + 1000) {
        const fps = Math.round((fpsRef.current.frames * 1000) / (currentTime - fpsRef.current.lastTime));
        fpsRef.current.fps = fps;
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = currentTime;
        
        const timeSinceLastAdjustment = currentTime - fpsRef.current.lastAdjustment;
        if (timeSinceLastAdjustment > 3000) {
          const currentCount = particlesRef.current.length;
          
          if (fps < 30 && currentCount > 30) {
            fpsRef.current.targetParticleCount = Math.max(30, Math.floor(currentCount * 0.75));
            initParticles(fpsRef.current.targetParticleCount);
            fpsRef.current.lastAdjustment = currentTime;
          } else if (fps > 55 && currentCount < 100) {
            fpsRef.current.targetParticleCount = Math.min(100, Math.floor(currentCount * 1.15));
            initParticles(fpsRef.current.targetParticleCount);
            fpsRef.current.lastAdjustment = currentTime;
          }
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        // Enhanced mouse influence with velocity
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 180) {
          const force = (180 - distance) / 180;
          const attractionStrength = distance < 60 ? -0.03 : 0.02;
          particle.speedX += (dx / distance) * force * attractionStrength;
          particle.speedY += (dy / distance) * force * attractionStrength;
          
          // Add velocity influence
          particle.speedX += mouseRef.current.velocity.x * 0.001;
          particle.speedY += mouseRef.current.velocity.y * 0.001;
        }

        // Scroll velocity influence
        particle.speedY += scrollVelocityRef.current * 0.002;

        // Apply friction differently for currency symbols
        const friction = particle.isCurrency ? 0.98 : 0.99;
        particle.speedX *= friction;
        particle.speedY *= friction;

        // Gravity for currency symbols
        if (particle.isCurrency) {
          particle.speedY += 0.1;
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        // Wrap around edges
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        const fadeOpacity = Math.min(particle.life / 60, 1) * particle.opacity;

        if (particle.isCurrency && particle.emoji) {
          // Draw emoji
          ctx.save();
          ctx.globalAlpha = fadeOpacity;
          ctx.font = `${particle.size * 2}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(particle.emoji, particle.x, particle.y);
          ctx.restore();
        } else {
          // Draw particle with glow
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          );
          gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${fadeOpacity})`);
          gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, ${fadeOpacity * 0.5})`);
          gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 40%, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        return particle.life > 0 && particle.y > -20;
      });

      // Spawn new particles with occasional currency
      if (Math.random() < 0.4 && particlesRef.current.length < fpsRef.current.targetParticleCount) {
        const isCurrency = Math.random() < 0.1;
        particlesRef.current.push(createParticle(undefined, undefined, false, isCurrency));
      }

      // Decay velocities
      mouseRef.current.velocity.x *= 0.95;
      mouseRef.current.velocity.y *= 0.95;
      scrollVelocityRef.current *= 0.95;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion, preferences.particles, isVisible]);

  if (prefersReducedMotion || !preferences.particles) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

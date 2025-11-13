import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  life: number;
}

export const ParticleBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Create initial particles with more variety
    const createParticle = (x?: number, y?: number, burst = false): Particle => ({
      x: x ?? Math.random() * canvas.width,
      y: y ?? (burst ? y : canvas.height + 10),
      size: Math.random() * (burst ? 5 : 3) + (burst ? 2 : 1),
      speedY: burst ? (Math.random() - 0.5) * 3 : -(Math.random() * 1.5 + 0.5),
      speedX: (Math.random() - 0.5) * (burst ? 2 : 0.8),
      opacity: Math.random() * 0.6 + (burst ? 0.4 : 0.2),
      life: Math.random() * (burst ? 150 : 250) + (burst ? 50 : 100),
    });

    // Initialize particles with varied distribution
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push(createParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }

    // Mouse move handler with trail effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Enhanced chance to spawn particle trail near mouse
      if (Math.random() < 0.15) {
        particlesRef.current.push(
          createParticle(
            e.clientX + (Math.random() - 0.5) * 60,
            e.clientY + (Math.random() - 0.5) * 60,
            true
          )
        );
      }
    };

    // Click handler - enhanced burst of particles
    const handleClick = (e: MouseEvent) => {
      // Create a radial burst pattern
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = Math.random() * 3 + 1.5;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 5 + 2,
          speedY: Math.sin(angle) * speed,
          speedX: Math.cos(angle) * speed,
          opacity: 0.9,
          life: 80,
        });
      }
      // Add some random scattered particles
      for (let i = 0; i < 10; i++) {
        particlesRef.current.push(
          createParticle(
            e.clientX + (Math.random() - 0.5) * 100,
            e.clientY + (Math.random() - 0.5) * 100,
            true
          )
        );
      }
    };

    // Visibility change handler
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Animation loop
    const animate = () => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles with enhanced physics
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Enhanced mouse influence with attraction/repulsion
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          const attractionStrength = distance < 50 ? -0.02 : 0.015; // Repel when too close
          particle.speedX += (dx / distance) * force * attractionStrength;
          particle.speedY += (dy / distance) * force * attractionStrength;
        }

        // Apply friction
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        // Wrap around edges for continuous effect
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;

        // Fade out based on life
        const fadeOpacity = Math.min(particle.life / 50, 1) * particle.opacity;

        // Draw particle
        ctx.fillStyle = `hsla(var(--accent-hsl), ${fadeOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Keep particle if still alive and on screen
        return particle.life > 0 && particle.y > -10;
      });

      // Spawn new particles at bottom
      if (Math.random() < 0.3 && particlesRef.current.length < 50) {
        particlesRef.current.push(createParticle());
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion, isVisible]);

  if (prefersReducedMotion) {
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


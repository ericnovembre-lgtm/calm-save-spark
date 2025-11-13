import { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";

export const MouseGradient = () => {
  const prefersReducedMotion = useReducedMotion();
  const { preferences } = useMotionPreferences();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion || !preferences.gradients) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Mouse move handler with smoothing
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    // Visibility change handler
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Get CSS variable colors
    const getColor = (name: string, fallback: string) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return value || fallback;
    };

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Smooth interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create radial gradient following mouse
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        Math.max(window.innerWidth, window.innerHeight) * 0.6
      );

      // Get accent color from CSS variables
      const accentRaw = getColor("--accent", "40 20% 55%");

      // Parse HSL values whether they're space or comma separated
      let h: string, s: string, l: string;

      if (accentRaw.includes(",")) {
        // Already comma-separated: "40, 20%, 55%"
        [h, s, l] = accentRaw.split(",").map(v => v.trim());
      } else {
        // Space-separated modern format: "40 20% 55%"
        [h, s, l] = accentRaw.split(" ").map(v => v.trim());
      }

      // Create Canvas-compatible HSLA colors (comma-separated format required)
      gradient.addColorStop(0, `hsla(${h}, ${s}, ${l}, 0.15)`);
      gradient.addColorStop(0.5, `hsla(${h}, ${s}, ${l}, 0.05)`);
      gradient.addColorStop(1, "hsla(0, 0%, 0%, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion, preferences.gradients, isVisible]);

  if (prefersReducedMotion || !preferences.gradients) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    />
  );
};

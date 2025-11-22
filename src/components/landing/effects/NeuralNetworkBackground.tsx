import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const performanceCheckRef = useRef({ frameCount: 0, startTime: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Performance monitoring
    performanceCheckRef.current.startTime = performance.now();

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Node configuration - adaptive quality based on device
    const nodeCount = isMobile ? 5 : 25;
    const connectionDistance = isMobile ? 80 : 150;
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    const maxDistance = connectionDistance;
    let mouseX = 0;
    let mouseY = 0;
    let isMouseOnCanvas = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isMouseOnCanvas = true;
    };

    const handleMouseLeave = () => {
      isMouseOnCanvas = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId: number;

    const animate = () => {
      // Performance tracking
      performanceCheckRef.current.frameCount++;
      if (performanceCheckRef.current.frameCount === 60) {
        const elapsed = performance.now() - performanceCheckRef.current.startTime;
        const fps = (60 / elapsed) * 1000;
        if (fps < 30) {
          console.warn('[NeuralNetworkBackground] Low FPS detected:', fps.toFixed(1));
        }
        performanceCheckRef.current.frameCount = 0;
        performanceCheckRef.current.startTime = performance.now();
      }

      ctx.fillStyle = 'rgba(250, 248, 242, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node) => {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // React to mouse
        if (isMouseOnCanvas) {
          const dx = mouseX - node.x;
          const dy = mouseY - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            node.x -= dx * 0.01;
            node.y -= dy * 0.01;
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(var(--primary) / 0.6)';
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const opacity = (1 - distance / maxDistance) * 0.3;
            ctx.strokeStyle = `hsl(var(--primary) / ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', setCanvasSize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion, isMobile]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-10 -z-10"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}

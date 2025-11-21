import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createNoise2D } from 'simplex-noise';
import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProceduralArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed, setSeed] = useState(Math.random());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noise = createNoise2D();
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Generate procedural art
    for (let x = 0; x < width; x += 4) {
      for (let y = 0; y < height; y += 4) {
        const value = noise(x * 0.01 + seed, y * 0.01 + seed);
        const hue = (value + 1) * 180;
        const saturation = 70;
        const lightness = 30 + (value + 1) * 20;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, 4, 4);
      }
    }
  }, [seed]);

  const regenerate = () => {
    setSeed(Math.random());
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'financial-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg"
    >
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Procedural Art</h3>
          <p className="text-sm text-muted-foreground">Your unique financial signature</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={regenerate}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={download}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <motion.div
        key={seed}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full"
        />
      </motion.div>
    </motion.div>
  );
}

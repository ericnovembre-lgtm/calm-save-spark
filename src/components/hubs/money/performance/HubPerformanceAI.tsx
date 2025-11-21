import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge } from 'lucide-react';

export function HubPerformanceAI() {
  const [fps, setFps] = useState(60);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime >= lastTime + 1000) {
        setFps(frameCount);
        
        // Adaptive quality
        if (frameCount < 30) {
          setQuality('low');
        } else if (frameCount < 50) {
          setQuality('medium');
        } else {
          setQuality('high');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      className="fixed bottom-6 left-6 z-40 bg-card/80 backdrop-blur-sm p-3 rounded-lg text-xs"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          <span className={fps >= 55 ? 'text-green-500' : fps >= 30 ? 'text-yellow-500' : 'text-red-500'}>
            {fps} FPS
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="capitalize">{quality}</span>
        </div>
      </div>
    </motion.div>
  );
}

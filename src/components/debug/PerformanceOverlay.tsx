/**
 * Performance Overlay Component
 * Dev-only floating overlay showing real-time performance metrics
 */
import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, Cpu, Clock, Zap } from 'lucide-react';
import { getAllRenderMetrics, resetRenderMetrics } from '@/hooks/useRenderProfiler';
import { Button } from '@/components/ui/button';

interface PerformanceData {
  fps: number;
  memory?: number;
  renderCount: number;
  slowRenders: number;
  longTasks: number;
}

// Only render in development
const isDev = process.env.NODE_ENV === 'development';

export const PerformanceOverlay = memo(function PerformanceOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<PerformanceData>({
    fps: 60,
    memory: undefined,
    renderCount: 0,
    slowRenders: 0,
    longTasks: 0,
  });

  // Don't render in production
  if (!isDev) return null;

  // FPS tracking
  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setData(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, [isVisible]);

  // Memory tracking
  useEffect(() => {
    if (!isVisible) return;

    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as { memory: { usedJSHeapSize: number } }).memory;
        setData(prev => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1048576), // MB
        }));
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Render metrics tracking
  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const metrics = getAllRenderMetrics();
      let totalRenders = 0;
      let slowRenders = 0;

      metrics.forEach((m) => {
        totalRenders += m.renderCount;
        slowRenders += m.slowRenders;
      });

      setData(prev => ({
        ...prev,
        renderCount: totalRenders,
        slowRenders,
      }));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Long task tracking
  useEffect(() => {
    if (!isVisible || !('PerformanceObserver' in window)) return;

    let longTaskCount = 0;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(() => {
        longTaskCount++;
        setData(prev => ({ ...prev, longTasks: longTaskCount }));
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Long task observer not supported
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[9999] p-2 rounded-full bg-slate-900/90 border border-white/10 text-white/70 hover:text-white hover:bg-slate-800 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Toggle Performance Overlay"
      >
        <Activity className="w-4 h-4" />
      </motion.button>

      {/* Overlay Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-16 right-4 z-[9999] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            style={{ width: isExpanded ? 320 : 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-semibold text-white">Performance</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 text-white/50 hover:text-white transition-colors"
                >
                  <Cpu className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-3 space-y-2">
              {/* FPS */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">FPS</span>
                <span className={`text-sm font-mono font-bold ${getFPSColor(data.fps)}`}>
                  {data.fps}
                </span>
              </div>

              {/* Memory */}
              {data.memory !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Memory</span>
                  <span className="text-sm font-mono text-white/90">
                    {data.memory} MB
                  </span>
                </div>
              )}

              {/* Render Count */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Renders</span>
                <span className="text-sm font-mono text-white/90">
                  {data.renderCount}
                </span>
              </div>

              {/* Slow Renders */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Slow (&gt;16ms)</span>
                <span className={`text-sm font-mono ${data.slowRenders > 0 ? 'text-yellow-500' : 'text-white/90'}`}>
                  {data.slowRenders}
                </span>
              </div>

              {/* Long Tasks */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Long Tasks</span>
                <span className={`text-sm font-mono ${data.longTasks > 0 ? 'text-red-500' : 'text-white/90'}`}>
                  {data.longTasks}
                </span>
              </div>

              {/* Expanded: Component breakdown */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">Component Renders</span>
                    <button
                      onClick={resetRenderMetrics}
                      className="text-[10px] text-primary hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {Array.from(getAllRenderMetrics().entries())
                      .sort((a, b) => b[1].renderCount - a[1].renderCount)
                      .slice(0, 10)
                      .map(([name, metrics]) => (
                        <div key={name} className="flex items-center justify-between text-[10px]">
                          <span className="text-white/50 truncate max-w-[150px]">{name}</span>
                          <div className="flex gap-2">
                            <span className="text-white/70">{metrics.renderCount}x</span>
                            <span className={metrics.averageRenderDuration > 16 ? 'text-yellow-500' : 'text-white/50'}>
                              {metrics.averageRenderDuration.toFixed(1)}ms
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

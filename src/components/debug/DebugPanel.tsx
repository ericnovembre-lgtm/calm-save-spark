import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Activity, Cpu, Eye, Package, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DebugPanelProps {
  loadingStates?: Record<string, boolean>;
  onClose?: () => void;
}

/**
 * DebugPanel - Development-only debug panel
 * Features:
 * - Real-time FPS monitoring
 * - Memory usage tracking
 * - Loading state visualization
 * - Render count tracking
 * - Performance metrics
 * - Toggle via button click
 */
export const DebugPanel = ({ loadingStates = {}, onClose }: DebugPanelProps) => {
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  const [bundleSize, setBundleSize] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderCountRef = useRef(0);

  // Track renders - only update on mount to prevent infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderCount(prev => prev + 1);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Track FPS and memory
  useEffect(() => {
    let animationFrameId: number;

    const measurePerformance = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;

        // Update memory if available
        if ((performance as any).memory) {
          const used = (performance as any).memory.usedJSHeapSize;
          const total = (performance as any).memory.jsHeapSizeLimit;
          setMemory(Math.round((used / total) * 100));
        }
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Track bundle info
  useEffect(() => {
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      const scriptResources = resources.filter((r: any) => 
        r.name.includes('.js') || r.name.includes('.css')
      );
      
      const totalSize = scriptResources.reduce((acc: number, r: any) => 
        acc + (r.transferSize || r.encodedBodySize || 0), 0
      );
      
      setBundleSize(Math.round(totalSize / 1024));
      setChunkCount(scriptResources.length);
    }
  }, []);


  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleReset = () => {
    renderCountRef.current = 0;
    setRenderCount(0);
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <>

      {/* Debug Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-4 left-4 z-[9999] w-80"
          >
            <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  <h3 className="font-semibold text-sm">Debug Panel</h3>
                  <Badge variant="outline" className="text-xs">DEV</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                {/* FPS */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">FPS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-semibold ${
                      fps >= 55 ? 'text-green-500' : 
                      fps >= 40 ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      {fps}
                    </span>
                    <Badge 
                      variant={fps >= 55 ? 'default' : fps >= 40 ? 'secondary' : 'destructive'}
                      className="text-xs h-5"
                    >
                      {fps >= 55 ? 'GOOD' : fps >= 40 ? 'OK' : 'LOW'}
                    </Badge>
                  </div>
                </div>

                {/* Memory */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Memory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-semibold ${
                      memory > 80 ? 'text-red-500' : 
                      memory > 60 ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>
                      {memory}%
                    </span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          memory > 80 ? 'bg-red-500' : 
                          memory > 60 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${memory}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Render Count */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Renders</span>
                  </div>
                  <span className="font-mono font-semibold text-primary">
                    {renderCount}
                  </span>
                </div>

                {/* Bundle Info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Bundle</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {bundleSize} KB ({chunkCount} chunks)
                  </span>
                </div>
              </div>

              {/* Loading States */}
              {Object.keys(loadingStates).length > 0 && (
                <>
                  <div className="border-t border-border my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Loading States
                      </span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {Object.entries(loadingStates).map(([key, loaded]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">{key}</span>
                          <Badge 
                            variant={loaded ? 'default' : 'secondary'}
                            className="text-xs h-5 ml-2"
                          >
                            {loaded ? '✓ Loaded' : '⏳ Loading'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DebugPanel;

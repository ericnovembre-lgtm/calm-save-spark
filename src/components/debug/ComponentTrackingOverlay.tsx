import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Clock, RefreshCw, CheckCircle, XCircle, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  subscribeToComponentTracking,
  getAllTrackedComponents,
  type ComponentTrackingData,
} from '@/hooks/useComponentTracking';
import { cn } from '@/lib/utils';

/**
 * Visual debug overlay showing component mount/render performance
 */
export function ComponentTrackingOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [components, setComponents] = useState<Map<string, ComponentTrackingData>>(new Map());
  const [sortBy, setSortBy] = useState<'name' | 'renderTime' | 'renderCount'>('renderTime');

  useEffect(() => {
    // Initial load
    setComponents(getAllTrackedComponents());

    // Subscribe to updates
    const unsubscribe = subscribeToComponentTracking((data) => {
      setComponents(new Map(data));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Convert map to sorted array
  const sortedComponents = Array.from(components.values()).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'renderTime':
        return b.renderTime - a.renderTime;
      case 'renderCount':
        return b.renderCount - a.renderCount;
      default:
        return 0;
    }
  });

  const mountedCount = sortedComponents.filter(c => c.isMounted).length;
  const totalRenderTime = sortedComponents.reduce((sum, c) => sum + c.renderTime, 0);
  const avgRenderTime = sortedComponents.length > 0 
    ? totalRenderTime / sortedComponents.length 
    : 0;

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[9999] p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Open Component Tracking"
      >
        <Activity className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className={cn(
          "fixed right-4 z-[9999] bg-card border border-border rounded-lg shadow-2xl overflow-hidden",
          isMinimized ? "bottom-4 w-80" : "bottom-4 top-4 w-96"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Component Tracking</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-border bg-muted/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{mountedCount}</div>
                <div className="text-xs text-muted-foreground">Mounted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{avgRenderTime.toFixed(1)}ms</div>
                <div className="text-xs text-muted-foreground">Avg Render</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{sortedComponents.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2 p-3 border-b border-border">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
                className="flex-1"
              >
                Name
              </Button>
              <Button
                variant={sortBy === 'renderTime' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('renderTime')}
                className="flex-1"
              >
                <Clock className="w-3 h-3 mr-1" />
                Time
              </Button>
              <Button
                variant={sortBy === 'renderCount' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('renderCount')}
                className="flex-1"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Count
              </Button>
            </div>

            {/* Component List */}
            <ScrollArea className="flex-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              <div className="p-2 space-y-2">
                {sortedComponents.map((component) => (
                  <motion.div
                    key={component.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      component.isMounted
                        ? "bg-card border-border hover:bg-accent/50"
                        : "bg-muted/50 border-muted opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {component.isMounted ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm truncate">
                          {component.name}
                        </span>
                      </div>
                      <Badge
                        variant={component.renderTime > 100 ? 'destructive' : component.renderTime > 50 ? 'default' : 'secondary'}
                        className="flex-shrink-0"
                      >
                        {component.renderTime.toFixed(1)}ms
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        <span>{component.renderCount} renders</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(component.lastRenderTimestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {isMinimized && (
          <div className="p-4">
            <div className="text-sm text-muted-foreground text-center">
              {mountedCount} components mounted
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Eye, EyeOff, MapPin, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface TourTarget {
  tourStep: string;
  element: HTMLElement;
  rect: DOMRect;
}

/**
 * Debug overlay that shows all data-tour attributes on the page
 * Toggle via the floating button
 */
export function TourDebugOverlay() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [targets, setTargets] = useState<TourTarget[]>([]);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);


  // Find all data-tour elements
  useEffect(() => {
    if (!isEnabled) {
      setTargets([]);
      return;
    }

    const findTargets = () => {
      const elements = document.querySelectorAll('[data-tour]');
      const newTargets: TourTarget[] = [];

      elements.forEach((el) => {
        const tourStep = el.getAttribute('data-tour');
        if (tourStep) {
          newTargets.push({
            tourStep,
            element: el as HTMLElement,
            rect: el.getBoundingClientRect(),
          });
        }
      });

      setTargets(newTargets);
    };

    findTargets();

    // Update on scroll/resize
    const handleUpdate = () => findTargets();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // Observe DOM changes
    const observer = new MutationObserver(findTargets);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      observer.disconnect();
    };
  }, [isEnabled]);

  const scrollToTarget = (target: TourTarget) => {
    target.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHoveredTarget(target.tourStep);
    setTimeout(() => setHoveredTarget(null), 2000);
  };

  const exportTargets = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      page: window.location.pathname,
      totalTargets: targets.length,
      targets: targets.map((t, index) => ({
        index: index + 1,
        id: t.tourStep,
        position: {
          top: Math.round(t.rect.top),
          left: Math.round(t.rect.left),
          width: Math.round(t.rect.width),
          height: Math.round(t.rect.height),
        },
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour-targets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported tour targets to JSON');
  };

  const replaySpotlight = () => {
    localStorage.removeItem('whats-new-seen-version');
    localStorage.removeItem('feature-spotlight-seen');
    toast.success('Cleared spotlight data. Refreshing...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsEnabled(prev => !prev)}
        className={`fixed bottom-4 left-4 z-[9999] p-3 rounded-full shadow-lg transition-colors ${
          isEnabled 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground hover:bg-accent'
        }`}
        title="Toggle Tour Debug Mode"
      >
        <Bug className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isEnabled && (
          <>
            {/* Overlay indicators */}
            {targets.map((target) => (
              <motion.div
                key={target.tourStep}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: 'fixed',
                  top: target.rect.top - 4,
                  left: target.rect.left - 4,
                  width: target.rect.width + 8,
                  height: target.rect.height + 8,
                  pointerEvents: 'none',
                  zIndex: 9998,
                }}
                className={`border-2 rounded-lg transition-colors ${
                  hoveredTarget === target.tourStep
                    ? 'border-primary bg-primary/10'
                    : 'border-dashed border-primary/50'
                }`}
              >
                {showLabels && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-7 left-0 flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-mono shadow-md"
                  >
                    <MapPin className="w-3 h-3" />
                    {target.tourStep}
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Debug Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed top-4 left-4 z-[9999] w-72 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 bg-muted border-b border-border">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Tour Debug</span>
                  <Badge variant="secondary" className="text-xs">
                    {targets.length} targets
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowLabels(prev => !prev)}
                    title={showLabels ? 'Hide labels' : 'Show labels'}
                  >
                    {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={exportTargets}
                    title="Export targets to JSON"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsEnabled(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Target List */}
              <ScrollArea className="h-64">
                <div className="p-2 space-y-1">
                  {targets.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No data-tour attributes found
                    </p>
                  ) : (
                    targets.map((target, index) => (
                      <motion.button
                        key={target.tourStep}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => scrollToTarget(target)}
                        onMouseEnter={() => setHoveredTarget(target.tourStep)}
                        onMouseLeave={() => setHoveredTarget(null)}
                        className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors ${
                          hoveredTarget === target.tourStep
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-muted text-xs font-mono">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-xs font-mono truncate">
                          {target.tourStep}
                        </span>
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1"
                        >
                          {Math.round(target.rect.top)}px
                        </Badge>
                      </motion.button>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-2 border-t border-border bg-muted/50 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={replaySpotlight}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Replay Spotlight
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

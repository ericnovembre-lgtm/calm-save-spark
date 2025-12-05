/**
 * UpdatePrompt - Service Worker update notification
 * Shows non-intrusive banner when app update is available
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UpdatePromptProps {
  className?: string;
  /** Auto-refresh after idle time (ms, 0 to disable) */
  autoRefreshAfterIdle?: number;
  /** Position of the prompt */
  position?: 'top' | 'bottom';
}

export function UpdatePrompt({
  className,
  autoRefreshAfterIdle = 0,
  position = 'bottom',
}: UpdatePromptProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Listen for service worker updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // New service worker activated
      setUpdateAvailable(true);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    };

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    
    // Listen for messages from SW
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Check for waiting service worker
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

      // Listen for new waiting SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        }
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Auto-refresh after idle
  useEffect(() => {
    if (!updateAvailable || !autoRefreshAfterIdle || dismissed) return;

    let idleTimeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetTimer = () => {
      lastActivity = Date.now();
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        const idleTime = Date.now() - lastActivity;
        if (idleTime >= autoRefreshAfterIdle) {
          window.location.reload();
        }
      }, autoRefreshAfterIdle);
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    
    // Start timer
    resetTimer();

    return () => {
      clearTimeout(idleTimeout);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [updateAvailable, autoRefreshAfterIdle, dismissed]);

  // Refresh the app
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    
    // Tell waiting SW to skip waiting
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }

    // Reload after a brief delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  // Dismiss the prompt
  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  // Don't show if no update or dismissed
  if (!updateAvailable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'top' ? -100 : 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'top' ? -100 : 100 }}
        className={cn(
          'fixed left-4 right-4 z-50 mx-auto max-w-md',
          position === 'top' ? 'top-4' : 'bottom-20',
          className
        )}
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-violet-600/90 backdrop-blur-xl shadow-lg border border-white/10">
          {/* Animated background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          
          <div className="relative flex items-center gap-3 p-4">
            {/* Icon */}
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                New version available!
              </p>
              <p className="text-xs text-white/70 truncate">
                Refresh to get the latest features
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white text-primary hover:bg-white/90 font-medium"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </div>

          {/* Progress bar for auto-refresh */}
          {autoRefreshAfterIdle > 0 && (
            <motion.div
              className="h-0.5 bg-white/30"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoRefreshAfterIdle / 1000, ease: 'linear' }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to check for updates programmatically
 */
export function useUpdateCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      if (registration.waiting) {
        setUpdateAvailable(true);
        return true;
      }
    } catch (error) {
      console.warn('[UpdateCheck] Failed to check for updates:', error);
    }
    
    return false;
  }, []);

  const applyUpdate = useCallback(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }, []);

  return {
    updateAvailable,
    checkForUpdate,
    applyUpdate,
  };
}

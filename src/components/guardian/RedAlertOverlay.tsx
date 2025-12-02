import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Phone, X } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDeactivateLockdown } from '@/hooks/useLockdownStatus';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/button';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';

export function RedAlertOverlay() {
  const { isLockdownActive, lockdownActivatedAt } = useSettingsStore();
  const deactivateMutation = useDeactivateLockdown();
  const prefersReducedMotion = useReducedMotion();
  const [isMinimized, setIsMinimized] = useState(false);

  // Listen for cross-tab broadcasts
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel('lockdown-sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'LOCKDOWN_ACTIVATED') {
        useSettingsStore.getState().setLockdownActive(true);
        useSettingsStore.getState().setLockdownActivatedAt(event.data.timestamp);
      } else if (event.data.type === 'LOCKDOWN_DEACTIVATED') {
        useSettingsStore.getState().setLockdownActive(false);
        useSettingsStore.getState().setLockdownActivatedAt(null);
      }
    };

    return () => channel.close();
  }, []);

  const handleDeactivate = async () => {
    haptics.vibrate('medium');
    soundEffects.success();
    await deactivateMutation.mutateAsync();
  };

  if (!isLockdownActive) return null;

  return (
    <AnimatePresence>
      {isLockdownActive && (
        <>
          {/* Pulsing border overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            {/* Pulsing red border */}
            <motion.div
              className="absolute inset-0 border-4 border-rose-500/50"
              animate={prefersReducedMotion ? {} : {
                borderColor: ['rgba(244, 63, 94, 0.5)', 'rgba(244, 63, 94, 0.8)', 'rgba(244, 63, 94, 0.5)'],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-rose-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-rose-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-rose-500" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-rose-500" />

            {/* Scanline effect */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-rose-500/5"
                style={{ backgroundSize: '100% 4px' }}
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.div>

          {/* Top banner */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed top-0 left-0 right-0 z-[101] ${isMinimized ? 'h-8' : 'h-auto'}`}
          >
            <div className="bg-gradient-to-r from-rose-900/95 via-rose-800/95 to-rose-900/95 backdrop-blur-xl border-b-2 border-rose-500 shadow-lg shadow-rose-500/20">
              {isMinimized ? (
                <button
                  onClick={() => setIsMinimized(false)}
                  className="w-full h-full flex items-center justify-center gap-2 text-rose-200 hover:text-white transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest">LOCKDOWN ACTIVE - Click to expand</span>
                </button>
              ) : (
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="p-2 rounded-lg bg-rose-500/30"
                      >
                        <Shield className="w-6 h-6 text-rose-200" />
                      </motion.div>
                      <div>
                        <h3 className="text-rose-100 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                          🚨 EMERGENCY LOCKDOWN ACTIVE
                        </h3>
                        <p className="text-rose-300/80 text-xs font-mono">
                          All cards frozen • API access revoked • Third-party connections severed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Emergency support */}
                      <a
                        href="tel:1-800-SAVE-NOW"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono hover:bg-emerald-500/30 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        1-800-SAVE-NOW
                      </a>

                      {/* Deactivate button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeactivate}
                        disabled={deactivateMutation.isPending}
                        className="text-rose-200 hover:text-white hover:bg-rose-500/20 border border-rose-500/30"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
                      </Button>

                      {/* Minimize button */}
                      <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 rounded hover:bg-rose-500/20 text-rose-300 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {lockdownActivatedAt && (
                    <p className="text-rose-400/60 text-[10px] font-mono mt-1 text-center">
                      Activated: {new Date(lockdownActivatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

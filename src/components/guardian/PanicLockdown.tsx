import { useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, Phone, Shield, Lock } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSettingsStore } from '@/stores/settingsStore';
import { useActivateLockdown, useDeactivateLockdown, useLockdownStatus } from '@/hooks/useLockdownStatus';

interface PanicLockdownProps {
  onLockdown?: () => void;
  /** Preview mode uses local state instead of database hooks */
  previewMode?: boolean;
}

// Emergency Support Card shown after lockdown
function EmergencySupportCard({ onDeactivate, isDeactivating }: { onDeactivate: () => void; isDeactivating: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="text-center py-4">
        <motion.div
          animate={prefersReducedMotion ? {} : { 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <Lock className="w-8 h-8 text-rose-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-rose-400 mb-2">🚨 ACCOUNT LOCKED</h3>
        <p className="text-white/60 text-sm">
          All cards frozen. API access revoked. Third-party connections severed.
        </p>
      </div>
      
      <div className="space-y-3">
        <Card className="bg-card/50 border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/50">24/7 Emergency Support</p>
              <p className="text-lg font-mono font-bold text-white">1-800-SAVE-NOW</p>
            </div>
          </div>
        </Card>
        
        <Button
          variant="ghost"
          className="w-full border border-white/10 hover:bg-white/5"
          onClick={onDeactivate}
          disabled={isDeactivating}
        >
          <Shield className="w-4 h-4 mr-2" />
          {isDeactivating ? 'Deactivating...' : 'Deactivate Lockdown'}
        </Button>
      </div>
    </motion.div>
  );
}

export function PanicLockdown({ onLockdown, previewMode = false }: PanicLockdownProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [previewLockdownActive, setPreviewLockdownActive] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const { isLockdownActive } = useSettingsStore();
  const { data: lockdownStatus } = useLockdownStatus();
  const activateMutation = useActivateLockdown();
  const deactivateMutation = useDeactivateLockdown();
  
  const trackWidth = 280;
  const handleWidth = 56;
  const threshold = trackWidth - handleWidth - 16;

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x > threshold) {
      activateLockdown();
    }
    setDragX(0);
  };

  const activateLockdown = async () => {
    haptics.pattern('error');
    soundEffects.error();
    if (previewMode) {
      setPreviewLockdownActive(true);
    } else {
      await activateMutation.mutateAsync('Manual emergency lockdown');
    }
    onLockdown?.();
  };

  const deactivateLockdown = async () => {
    haptics.vibrate('medium');
    soundEffects.success();
    if (previewMode) {
      setPreviewLockdownActive(false);
    } else {
      await deactivateMutation.mutateAsync();
    }
  };

  const progress = Math.min(dragX / threshold, 1);
  
  // Determine if lockdown is active (preview uses local state)
  const isCurrentlyLocked = previewMode 
    ? previewLockdownActive 
    : (isLockdownActive || lockdownStatus?.is_active);

  // Show emergency card if lockdown is active
  if (isCurrentlyLocked) {
    return (
      <EmergencySupportCard 
        onDeactivate={deactivateLockdown} 
        isDeactivating={previewMode ? false : deactivateMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-sm font-mono text-rose-400 uppercase tracking-widest">
            EMERGENCY LOCKDOWN
          </h3>
          <p className="text-xs text-white/40">Freeze all accounts and revoke access</p>
        </div>
      </div>
      
      {/* Slide to Lock Control */}
      <div className="relative">
        <div 
          className="relative h-14 bg-rose-950/50 rounded-xl overflow-hidden border-2 border-rose-500/30"
          style={{ width: trackWidth }}
        >
          {/* Progress Background */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-rose-500/30"
            style={{ width: `${progress * 100}%` }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: progress > 0.8 ? 0.6 : 0.3 }}
          />
          
          {/* Warning Pulse on near-activation */}
          <AnimatePresence>
            {progress > 0.7 && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 bg-rose-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
          
          {/* Label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm font-mono text-rose-300/70">
              {progress > 0.8 ? '⚠️ RELEASE TO LOCK' : 'SLIDE TO FREEZE ALL'}
            </span>
          </div>
          
          {/* Draggable Handle */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: threshold }}
            dragElastic={0}
            onDragStart={() => {
              setIsDragging(true);
              haptics.vibrate('light');
            }}
            onDragEnd={handleDragEnd}
            onDrag={(_, info) => {
              setDragX(info.offset.x);
              // Haptic feedback at thresholds
              if (info.offset.x > threshold * 0.5 && info.offset.x < threshold * 0.52) {
                haptics.vibrate('light');
              }
              if (info.offset.x > threshold * 0.8 && info.offset.x < threshold * 0.82) {
                haptics.vibrate('medium');
              }
            }}
            animate={prefersReducedMotion ? {} : {
              x: dragX,
              scale: isDragging ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute left-2 top-2 bottom-2 w-12 bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg shadow-rose-500/30"
            style={{ touchAction: 'none' }}
          >
            <AlertTriangle className="w-5 h-5 text-white" />
          </motion.div>
          
          {/* Chevron Hints */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-30 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={prefersReducedMotion ? {} : {
                  x: [0, 4, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              >
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Warning Text */}
      <p className="text-xs text-white/30 font-mono text-center">
        This will immediately freeze all cards and revoke API access
      </p>
    </div>
  );
}

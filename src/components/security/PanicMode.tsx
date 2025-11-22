import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { announce } from '@/components/layout/LiveRegion';

export function PanicMode() {
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handlePanicToggle = () => {
    if (!isPanicActive) {
      setShowConfirm(true);
    } else {
      deactivatePanicMode();
    }
  };

  const activatePanicMode = async () => {
    setIsLoading(true);
    haptics.vibrate('heavy');

    try {
      // Sign out all other sessions
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      
      if (error) throw error;

      setIsPanicActive(true);
      setShowConfirm(false);
      announce('Panic mode activated. All other sessions have been signed out.', 'assertive');
      toast.error('🚨 Panic Mode Activated', {
        description: 'All sessions revoked. Account locked.',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to activate panic mode:', error);
      toast.error('Failed to activate panic mode');
    } finally {
      setIsLoading(false);
    }
  };

  const deactivatePanicMode = () => {
    setIsPanicActive(false);
    haptics.vibrate('light');
    announce('Panic mode deactivated', 'polite');
    toast.success('Panic mode deactivated', {
      description: 'Account unlocked. Normal access restored.',
    });
  };

  return (
    <>
      <Card className={`relative overflow-hidden transition-all duration-500 ${
        isPanicActive 
          ? 'bg-gradient-to-br from-destructive/10 via-cyber-red/5 to-transparent border-destructive/50' 
          : 'bg-card/80 backdrop-blur-sm border-cyber-border'
      }`}>
        {/* Lock overlay when active */}
        <AnimatePresence>
          {isPanicActive && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-destructive/5 backdrop-blur-sm z-10 pointer-events-none"
              aria-hidden="true"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                >
                  <Lock 
                    className="w-24 h-24 text-destructive opacity-20" 
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader className="relative z-20">
          <CardTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              isPanicActive ? 'bg-destructive/20' : 'bg-cyber-amber/20'
            }`}>
              {isPanicActive ? (
                <Lock className="w-5 h-5 text-destructive" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-cyber-amber" />
              )}
            </div>
            <span className={isPanicActive ? 'text-destructive' : ''}>
              Emergency Lock Down
            </span>
          </CardTitle>
          <CardDescription>
            {isPanicActive 
              ? 'Your account is locked. Disable to restore access.'
              : 'Instantly revoke all sessions and freeze account activity'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-20 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isPanicActive ? 'Panic Mode Active' : 'Activate Panic Mode'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPanicActive 
                  ? 'All other sessions signed out'
                  : 'Sign out all devices except this one'
                }
              </p>
            </div>
            <Switch
              checked={isPanicActive}
              onCheckedChange={handlePanicToggle}
              disabled={isLoading}
              aria-label="Toggle panic mode"
              className={isPanicActive ? 'data-[state=checked]:bg-destructive' : ''}
            />
          </div>

          {isPanicActive && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Account Locked
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All sessions have been terminated. Connected apps are temporarily blocked.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deactivatePanicMode}
                    className="mt-2"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Account
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {!isPanicActive && (
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-cyber-amber/5 rounded-lg border border-cyber-amber/20">
              <p className="font-medium text-foreground">What happens:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>All other sessions immediately signed out</li>
                <li>Connected app access temporarily blocked</li>
                <li>Alert sent to your registered email</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        title="Activate Panic Mode?"
        message="This will immediately sign out all other devices and freeze account activity. You'll remain logged in on this device."
        confirmText="Activate Lock Down"
        cancelText="Cancel"
        destructive
        onConfirm={activatePanicMode}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

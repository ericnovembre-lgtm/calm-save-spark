import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetCarousel } from './WidgetCarousel';
import { MobileQuickGlance } from './MobileQuickGlance';
import { QuickTransactionEntry } from './QuickTransactionEntry';
import { MobileNotificationCenter } from './MobileNotificationCenter';
import { VoiceTransactionButton } from './VoiceTransactionButton';
import { EnhancedPullToRefresh } from '@/components/dashboard/EnhancedPullToRefresh';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobilePreferences } from '@/hooks/useMobilePreferences';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Bell, Plus, Receipt, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';

// Recent Activity List Component
function RecentActivityList() {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['recent_transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded mt-1 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl p-6 border border-border/50 text-center"
      >
        <motion.div
          animate={!prefersReducedMotion ? { 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          } : undefined}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3"
        >
          <Receipt className="w-5 h-5 text-muted-foreground" />
        </motion.div>
        <p className="text-sm text-muted-foreground">No recent transactions</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Start tracking to see activity here</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, i) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
          onClick={() => haptics.buttonPress()}
          className="bg-card rounded-xl p-4 border border-border/50 active:bg-card/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-lg",
                tx.amount < 0 ? "bg-red-500/10" : "bg-green-500/10"
              )}>
                {tx.category === 'food' ? '🍔' :
                 tx.category === 'transport' ? '🚗' :
                 tx.category === 'shopping' ? '🛍️' :
                 tx.category === 'entertainment' ? '🎮' :
                 tx.category === 'income' ? '💰' :
                 '💳'}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {tx.description || tx.merchant || 'Transaction'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(tx.transaction_date), { addSuffix: true })}
                </p>
              </div>
            </div>
            <span className={cn(
              "text-sm font-semibold",
              tx.amount < 0 ? "text-red-500" : "text-green-500"
            )}>
              {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function MobileDashboard() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { preferences } = useMobilePreferences();
  const { pendingCount, isOnline } = useOfflineQueue();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const queryClient = useQueryClient();

  // Branded pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    haptics.buttonPress();
    await queryClient.invalidateQueries({ queryKey: ['recent_transactions'] });
    await queryClient.invalidateQueries({ queryKey: ['balance'] });
    await queryClient.invalidateQueries({ queryKey: ['goals'] });
    await queryClient.invalidateQueries({ queryKey: ['budgets'] });
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [queryClient]);

  if (!isMobile) return null;

  return (
    <EnhancedPullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-bg-strong backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
              {!isOnline && (
                <span className="text-xs text-amber-500">Offline Mode</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    haptics.buttonPress();
                    setShowNotifications(true);
                  }}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center"
                    >
                      {/* Pulse ring animation */}
                      {!prefersReducedMotion && (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-destructive"
                          animate={{ 
                            scale: [1, 1.8, 1],
                            opacity: [0.6, 0, 0.6]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: 'easeOut'
                          }}
                        />
                      )}
                      <span className="relative z-10">{pendingCount > 9 ? '9+' : pendingCount}</span>
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Quick Glance Cards */}
        <section className="px-4 py-4">
          <MobileQuickGlance widgets={preferences?.quick_glance_widgets || ['balance', 'budget', 'goals']} />
        </section>

        {/* Widget Carousel */}
        <section className="py-4">
          <h2 className="px-4 text-sm font-medium text-muted-foreground mb-3">Your Widgets</h2>
          <WidgetCarousel widgetOrder={preferences?.home_widget_order || []} />
        </section>

        {/* Recent Activity - Real transactions or proper empty state */}
        <section className="px-4 py-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h2>
          <RecentActivityList />
        </section>

        {/* Floating Action Buttons with spring animation */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
          className="fixed bottom-20 right-4 flex flex-col gap-3 z-40"
        >
          <VoiceTransactionButton />
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
            <Button
              size="icon"
              onClick={() => {
                haptics.select();
                setShowQuickAdd(true);
              }}
              className={cn(
                "h-14 w-14 rounded-full shadow-lg",
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Notification Center Drawer */}
        <AnimatePresence>
          {showNotifications && (
            <MobileNotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </AnimatePresence>

        {/* Quick Transaction Entry */}
        <AnimatePresence>
          {showQuickAdd && (
            <QuickTransactionEntry onClose={() => setShowQuickAdd(false)} />
          )}
        </AnimatePresence>
      </div>
    </EnhancedPullToRefresh>
  );
}

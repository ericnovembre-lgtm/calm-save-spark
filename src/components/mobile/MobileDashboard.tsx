import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetCarousel } from './WidgetCarousel';
import { MobileQuickGlance } from './MobileQuickGlance';
import { QuickTransactionEntry } from './QuickTransactionEntry';
import { MobileNotificationCenter } from './MobileNotificationCenter';
import { VoiceTransactionButton } from './VoiceTransactionButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobilePreferences } from '@/hooks/useMobilePreferences';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Bell, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MobileDashboard() {
  const isMobile = useIsMobile();
  const { preferences } = useMobilePreferences();
  const { pendingCount, isOnline } = useOfflineQueue();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  if (!isMobile) return null;

  return (
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Button>
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

      {/* Recent Activity Placeholder */}
      <section className="px-4 py-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h2>
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
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded mt-1" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-40">
        <VoiceTransactionButton />
        <Button
          size="icon"
          onClick={() => setShowQuickAdd(true)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

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
  );
}

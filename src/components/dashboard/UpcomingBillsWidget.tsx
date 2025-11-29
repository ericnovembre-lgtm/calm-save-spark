import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, AlertTriangle, CheckCircle2, CreditCard, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { toast } from 'sonner';

interface UpcomingBillsWidgetProps {
  isUrgent?: boolean;
  onPayBill?: (billId: string) => void;
}

/**
 * Upcoming Bills Widget
 * Shows bills due within 7 days with urgency animations
 * Pulses amber when bill is due tomorrow
 */
export function UpcomingBillsWidget({ isUrgent, onPayBill }: UpcomingBillsWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  const { upcomingBills, isLoading } = useSubscriptions();

  // Sort bills by due date (soonest first)
  const sortedBills = [...(upcomingBills || [])].sort((a, b) => {
    return new Date(a.next_expected_date).getTime() - new Date(b.next_expected_date).getTime();
  });

  // Check if any bill is due tomorrow or today
  const hasCriticalBill = sortedBills.some(bill => {
    const daysUntil = differenceInDays(new Date(bill.next_expected_date), new Date());
    return daysUntil <= 1;
  });

  const handlePayBill = (billId: string, billName: string) => {
    // Optimistic UI - show success immediately
    toast.success(`Payment initiated for ${billName}`);
    onPayBill?.(billId);
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 0) return 'text-destructive';
    if (daysUntil <= 1) return 'text-warning';
    if (daysUntil <= 3) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const getUrgencyBg = (daysUntil: number) => {
    if (daysUntil <= 0) return 'bg-destructive/10 border-destructive/30';
    if (daysUntil <= 1) return 'bg-warning/10 border-warning/30';
    if (daysUntil <= 3) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-muted/50 border-border';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (sortedBills.length === 0) {
    return (
      <div className="p-6 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-3" />
        <h3 className="font-semibold text-foreground">All Caught Up!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No bills due in the next 7 days
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "p-6 rounded-xl relative overflow-hidden",
        hasCriticalBill && "ring-2 ring-warning/50"
      )}
      animate={
        hasCriticalBill && !prefersReducedMotion
          ? {
              boxShadow: [
                '0 0 0 0 hsla(var(--warning), 0.3)',
                '0 0 20px 5px hsla(var(--warning), 0.2)',
                '0 0 0 0 hsla(var(--warning), 0.3)',
              ],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Urgent glow background */}
      {hasCriticalBill && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <motion.div
          className={cn(
            "p-2 rounded-lg",
            hasCriticalBill ? "bg-warning/20" : "bg-muted"
          )}
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <CalendarClock className={cn(
            "w-5 h-5",
            hasCriticalBill ? "text-warning" : "text-foreground"
          )} />
        </motion.div>
        <div>
          <h3 className="font-semibold text-foreground">Upcoming Bills</h3>
          <p className="text-xs text-muted-foreground">
            {sortedBills.length} bill{sortedBills.length !== 1 ? 's' : ''} due this week
          </p>
        </div>
        {hasCriticalBill && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-warning/20 text-warning">
              <AlertTriangle className="w-3 h-3" />
              Urgent
            </span>
          </motion.div>
        )}
      </div>

      {/* Bills list */}
      <div className="space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {sortedBills.slice(0, 5).map((bill, index) => {
            const dueDate = new Date(bill.next_expected_date);
            const daysUntil = differenceInDays(dueDate, new Date());
            const isToday = daysUntil === 0;
            const isTomorrow = daysUntil === 1;

            return (
              <motion.div
                key={bill.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  getUrgencyBg(daysUntil),
                  "hover:scale-[1.02]"
                )}
              >
                {/* Merchant icon */}
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Bill info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {bill.merchant}
                  </p>
                  <p className={cn("text-xs", getUrgencyColor(daysUntil))}>
                    {isToday ? (
                      <span className="font-semibold">Due Today!</span>
                    ) : isTomorrow ? (
                      <span className="font-semibold">Due Tomorrow</span>
                    ) : (
                      <>Due {format(dueDate, 'MMM d')} ({formatDistanceToNow(dueDate, { addSuffix: true })})</>
                    )}
                  </p>
                </div>

                {/* Amount & action */}
                <div className="text-right shrink-0">
                  <p className="font-semibold text-foreground">
                    ${Number(bill.amount).toFixed(2)}
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant={daysUntil <= 1 ? "default" : "outline"}
                      className="h-7 text-xs mt-1"
                      onClick={() => handlePayBill(bill.id, bill.merchant)}
                    >
                      Pay Now
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View all link */}
      {sortedBills.length > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            View all {sortedBills.length} bills →
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

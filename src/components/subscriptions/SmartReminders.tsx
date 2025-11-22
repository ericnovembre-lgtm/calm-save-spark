import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, X, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Reminder {
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  icon: string;
  actions: string[];
}

interface SmartRemindersProps {
  upcomingBills: Array<{
    id: string;
    name: string;
    amount: number;
    nextBilling: string;
  }>;
  userBalance?: number;
}

export function SmartReminders({ upcomingBills, userBalance = 0 }: SmartRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchReminders() {
      setLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke(
          'generate-payment-reminders',
          { body: { upcomingBills, userBalance } }
        );

        if (error) throw error;
        setReminders(data.reminders || []);
      } catch (err) {
        console.error('Error fetching reminders:', err);
        setReminders([]);
      } finally {
        setLoading(false);
      }
    }

    if (upcomingBills.length > 0) {
      fetchReminders();
    } else {
      setLoading(false);
    }
  }, [upcomingBills, userBalance]);

  const visibleReminders = reminders.filter((_, idx) => !dismissedIds.has(idx));

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (visibleReminders.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {visibleReminders.map((reminder, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`p-3 border-l-4 ${
              reminder.priority === 'high' ? 'border-l-destructive' :
              reminder.priority === 'medium' ? 'border-l-accent' :
              'border-l-muted'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-0.5">{reminder.icon}</span>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium text-foreground">{reminder.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{reminder.message}</p>
                    {reminder.actions.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {reminder.actions.map((action, actionIdx) => (
                          <Button
                            key={actionIdx}
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => setDismissedIds(prev => new Set(prev).add(idx))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

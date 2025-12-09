import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BillCard } from "@/components/subscriptions/BillCard";
import { CalendarExport } from "@/components/subscriptions/CalendarExport";
import { UpcomingBillsSection } from "@/components/subscriptions/UpcomingBillsSection";
import { CustomBillCalendar } from "@/components/subscriptions/CustomBillCalendar";
import { SubscriptionSwipeMode } from "@/components/subscriptions/SubscriptionSwipeMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Calendar, DollarSign, Pause, Ghost, Layers, CalendarDays } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  
  const {
    subscriptions,
    activeBills,
    pausedBills,
    zombieBills,
    upcomingBills,
    monthlyTotal,
    isLoading,
    togglePause,
    deleteSubscription,
    markForCancellation,
  } = useSubscriptions();

  const detectMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Detection failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(`Detected ${data.subscriptions_detected} subscriptions`);
    },
    onError: () => {
      toast.error('Failed to detect subscriptions');
    },
  });

  const analyzeUsageMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-subscription-usage');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(`Analyzed ${data.totalAnalyzed} subscriptions. Found ${data.newZombies} zombie subscriptions.`);
    },
    onError: (error) => {
      toast.error('Failed to analyze subscriptions: ' + (error as Error).message);
    }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isSwipeMode) {
    return (
      <SubscriptionSwipeMode
        subscriptions={activeBills}
        onKeep={(id) => {
          const subscription = subscriptions.find(s => s.id === id);
          if (subscription) {
            supabase.from('subscription_usage_events').insert({
              user_id: subscription.user_id,
              event_type: 'kept_in_review',
              merchant: subscription.merchant,
              transaction_date: new Date().toISOString(),
            });
          }
        }}
        onMarkForCancellation={markForCancellation}
        onExit={() => setIsSwipeMode(false)}
      />
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Bills & Subscriptions
            </h1>
            <p className="text-muted-foreground">Track recurring payments and zombie subscriptions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link to="/bill-calendar">
                <CalendarDays className="w-4 h-4 mr-2" />
                Bill Calendar
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/recurring">
                <RefreshCw className="w-4 h-4 mr-2" />
                View All Recurring
              </Link>
            </Button>
            <Button onClick={() => setIsSwipeMode(true)} variant="outline">
              <Layers className="w-4 h-4 mr-2" />
              Swipe Mode
            </Button>
            <Button 
              onClick={() => analyzeUsageMutation.mutate()} 
              variant="outline"
              disabled={analyzeUsageMutation.isPending}
            >
              <Ghost className="w-4 h-4 mr-2" />
              {analyzeUsageMutation.isPending ? 'Scanning...' : 'Scan Zombies'}
            </Button>
            <CalendarExport subscriptions={activeBills} />
            <Button onClick={() => detectMutation.mutate()} disabled={detectMutation.isPending}>
              <RefreshCw className={`w-4 h-4 mr-2 ${detectMutation.isPending ? 'animate-spin' : ''}`} />
              Scan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Bills</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">{activeBills.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Due This Week</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{upcomingBills.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Zombie Bills</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600 dark:text-red-400">{zombieBills.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Total</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600 dark:text-green-400">${monthlyTotal.toFixed(2)}</div></CardContent>
          </Card>
        </div>

        <CustomBillCalendar bills={activeBills} onMarkForCancellation={markForCancellation} />

        {zombieBills.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ghost className="h-5 w-5 text-red-600" />
                <CardTitle>Zombie Subscriptions</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Subscriptions you're paying for but not using</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {zombieBills.map(bill => (
                  <BillCard key={bill.id} subscription={bill} onTogglePause={togglePause} onDelete={deleteSubscription} />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {upcomingBills.length > 0 && (
          <UpcomingBillsSection bills={upcomingBills} onTogglePause={togglePause} onDelete={deleteSubscription} />
        )}

        {activeBills.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Bills</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{activeBills.length} subscriptions</p>
              </div>
              <Link to="/goals"><Button variant="outline" size="sm">Create Savings Goal</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {activeBills.map(bill => (
                  <BillCard key={bill.id} subscription={bill} onTogglePause={togglePause} onDelete={deleteSubscription} />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {pausedBills.length > 0 && (
          <Card>
            <CardHeader><div className="flex items-center gap-2"><Pause className="h-5 w-5" /><CardTitle>Paused Bills</CardTitle></div></CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {pausedBills.map(bill => (
                  <BillCard key={bill.id} subscription={bill} onTogglePause={togglePause} onDelete={deleteSubscription} />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {subscriptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Calendar className="h-16 w-16 text-muted-foreground/50 mb-6" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                  No bills detected yet
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md text-center text-base">
                  Connect your accounts or scan your transactions to automatically detect recurring payments and subscriptions
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => detectMutation.mutate()} 
                    disabled={detectMutation.isPending} 
                    size="lg"
                    className="min-w-[200px]"
                  >
                    <RefreshCw className={`w-5 h-5 mr-2 ${detectMutation.isPending ? 'animate-spin' : ''}`} />
                    {detectMutation.isPending ? 'Scanning...' : 'Scan for Bills'}
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/accounts">Connect Account</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}

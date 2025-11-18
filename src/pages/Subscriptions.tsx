import { AppLayout } from "@/components/layout/AppLayout";
import { BillCard } from "@/components/subscriptions/BillCard";
import { CalendarExport } from "@/components/subscriptions/CalendarExport";
import { UpcomingBillsSection } from "@/components/subscriptions/UpcomingBillsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Calendar, DollarSign, Pause } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const {
    subscriptions,
    activeBills,
    pausedBills,
    upcomingBills,
    monthlyTotal,
    isLoading,
    togglePause,
    deleteSubscription,
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-muted-foreground">Loading subscriptions...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Bills & Subscriptions
            </h1>
            <p className="text-muted-foreground">Track and manage your recurring payments</p>
          </div>
          <div className="flex items-center gap-3">
            <CalendarExport subscriptions={activeBills} />
            <Button
              onClick={() => detectMutation.mutate()}
              disabled={detectMutation.isPending}
              variant="default"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${detectMutation.isPending ? 'animate-spin' : ''}`} />
              Scan for Bills
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bills</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeBills.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {upcomingBills.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${monthlyTotal.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bills Section */}
        {upcomingBills.length > 0 && (
          <UpcomingBillsSection
            bills={upcomingBills}
            onTogglePause={togglePause}
            onDelete={deleteSubscription}
          />
        )}

        {/* All Active Bills */}
        {activeBills.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Bills</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeBills.length} active {activeBills.length === 1 ? 'subscription' : 'subscriptions'}
                </p>
              </div>
              <Link to="/goals">
                <Button variant="outline" size="sm">
                  Create Savings Goal
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {activeBills.map(bill => (
                  <BillCard
                    key={bill.id}
                    subscription={bill}
                    onTogglePause={togglePause}
                    onDelete={deleteSubscription}
                  />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* Paused Bills */}
        {pausedBills.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Pause className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Paused Bills</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {pausedBills.length} paused {pausedBills.length === 1 ? 'subscription' : 'subscriptions'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {pausedBills.map(bill => (
                  <BillCard
                    key={bill.id}
                    subscription={bill}
                    onTogglePause={togglePause}
                    onDelete={deleteSubscription}
                  />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {subscriptions.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No bills detected yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Click "Scan for Bills" to automatically detect your recurring payments from transaction history
            </p>
            <Button
              onClick={() => detectMutation.mutate()}
              disabled={detectMutation.isPending}
              size="lg"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${detectMutation.isPending ? 'animate-spin' : ''}`} />
              {detectMutation.isPending ? 'Scanning...' : 'Scan for Bills'}
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { CashflowChart } from "@/components/insights/CashflowChart";
import { SpendingInsights } from "@/components/insights/SpendingInsights";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

export default function Insights() {
  const [forecastDays, setForecastDays] = useState(30);

  const { data: forecast, isLoading: forecastLoading, refetch: refetchForecast } = useQuery({
    queryKey: ['cashflow_forecast', forecastDays],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cashflow-forecast`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ days: forecastDays })
        }
      );

      if (!response.ok) throw new Error('Forecast failed');
      return response.json();
    },
  });

  const handleRefresh = async () => {
    await refetchForecast();
    toast.success('Insights refreshed');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Insights</h1>
            <p className="text-muted-foreground">AI-powered financial analysis and forecasting</p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className={`w-4 h-4 mr-2 ${forecastLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="forecast">Cash Flow</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4">
            {forecastLoading ? (
              <LoadingState />
            ) : forecast?.forecast ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${forecast.summary?.current_balance?.toFixed(2) || 0}
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
                    <p className="text-sm text-muted-foreground mb-1">Projected ({forecastDays} days)</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${forecast.summary?.projected_end_balance?.toFixed(2) || 0}
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
                    <p className="text-sm text-muted-foreground mb-1">Avg Daily Spending</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${Math.abs(forecast.summary?.avg_daily_spending || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <CashflowChart data={forecast.forecast} />

                <div className="flex gap-2">
                  <Button
                    variant={forecastDays === 30 ? "default" : "outline"}
                    onClick={() => setForecastDays(30)}
                  >
                    30 Days
                  </Button>
                  <Button
                    variant={forecastDays === 60 ? "default" : "outline"}
                    onClick={() => setForecastDays(60)}
                  >
                    60 Days
                  </Button>
                  <Button
                    variant={forecastDays === 90 ? "default" : "outline"}
                    onClick={() => setForecastDays(90)}
                  >
                    90 Days
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Not enough transaction history for forecasting</p>
                <p className="text-sm mt-2">Add transactions to see cash flow predictions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="spending">
            <SpendingInsights />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

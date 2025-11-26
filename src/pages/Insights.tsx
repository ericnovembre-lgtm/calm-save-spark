import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { CashflowChart } from "@/components/insights/CashflowChart";
import { SpendingInsights } from "@/components/insights/SpendingInsights";
import { MonthlySpendingChart } from "@/components/insights/MonthlySpendingChart";
import { MonthlyDetailView } from "@/components/insights/MonthlyDetailView";
import { CategoryDetailView } from "@/components/insights/CategoryDetailView";
import { ScenarioPlayground } from "@/components/insights/ScenarioPlayground";
import { InsightsBreadcrumb } from "@/components/insights/InsightsBreadcrumb";
import { ChartExplanation } from "@/components/insights/ChartExplanation";
import { BehavioralInsightsPanel } from "@/components/ai/BehavioralInsightsPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import { useInsightsDrilldown } from "@/hooks/useInsightsDrilldown";
import { useChartExplanation } from "@/hooks/useChartExplanation";

export default function Insights() {
  const [forecastDays, setForecastDays] = useState(30);
  const { state, drillIntoMonth, drillIntoCategory, goBack, breadcrumbs, canGoBack } = useInsightsDrilldown();
  const { explanation, isLoading: explanationLoading, generateExplanation, clearExplanation } = useChartExplanation();

  // Fetch aggregated insights data
  const { data: aggregatedData, isLoading: aggregatedLoading } = useQuery({
    queryKey: ['insights_aggregated'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aggregate-insights-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timeframe: '6months' })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch insights');
      }

      return response.json();
    },
  });

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

  const handleExplainCashflow = () => {
    if (forecast?.forecast) {
      generateExplanation({
        type: 'cashflow',
        timeframe: `${forecastDays} days`,
        data: forecast.forecast,
        metrics: forecast.summary
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {canGoBack && (
                <Button variant="ghost" size="icon" onClick={goBack}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-4xl font-display font-bold text-foreground">Insights</h1>
            </div>
            <InsightsBreadcrumb breadcrumbs={breadcrumbs} />
            <p className="text-muted-foreground mt-1">AI-powered financial analysis and forecasting</p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className={`w-4 h-4 mr-2 ${forecastLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {state.view === 'overview' && (
          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="forecast">Cash Flow</TabsTrigger>
              <TabsTrigger value="spending">Spending</TabsTrigger>
              <TabsTrigger value="behavioral">AI Insights</TabsTrigger>
              <TabsTrigger value="scenarios">What-If</TabsTrigger>
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

                  <div className="space-y-4">
                    <CashflowChart data={forecast.forecast} />
                    
                    <ChartExplanation
                      explanation={explanation}
                      isLoading={explanationLoading}
                      onGenerate={handleExplainCashflow}
                      onClose={clearExplanation}
                    />
                  </div>

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

            <TabsContent value="spending" className="space-y-4">
              {aggregatedLoading ? (
                <LoadingState />
              ) : (
                <>
                  {aggregatedData?.monthlyData && (
                    <MonthlySpendingChart 
                      data={aggregatedData.monthlyData}
                      onMonthClick={drillIntoMonth}
                    />
                  )}
                  <SpendingInsights />
                </>
              )}
            </TabsContent>

            <TabsContent value="behavioral">
              <BehavioralInsightsPanel />
            </TabsContent>

            <TabsContent value="scenarios">
              <ScenarioPlayground />
            </TabsContent>
          </Tabs>
        )}

        {state.view === 'monthly' && state.selectedMonth && (
          <MonthlyDetailView 
            month={state.selectedMonth}
            onCategoryClick={drillIntoCategory}
          />
        )}

        {state.view === 'category' && state.selectedCategory && (
          <CategoryDetailView 
            category={state.selectedCategory}
            month={state.selectedMonth}
          />
        )}
      </div>
    </AppLayout>
  );
}

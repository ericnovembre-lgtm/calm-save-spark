import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { withPageMemo } from "@/lib/performance-utils";
import { withPageErrorBoundary } from "@/components/error/withPageErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, PieChart, FileText, Sparkles, Loader2, DollarSign, Brain, Play, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAnalyticsData, useAIInsights, type Timeframe } from "@/hooks/useAnalyticsData";
import { useSeedSampleData } from "@/hooks/useSeedSampleData";
import { TimeframePicker } from "@/components/analytics/TimeframePicker";
import { SpendingOverviewCards } from "@/components/analytics/SpendingOverviewCards";
import { SpendingTrendsChart } from "@/components/analytics/SpendingTrendsChart";
import { CategoryBreakdownChart } from "@/components/analytics/CategoryBreakdownChart";
import { PredictiveInsightsPanel } from "@/components/analytics/PredictiveInsightsPanel";
import { SpendingComparison } from "@/components/analytics/SpendingComparison";
import { ExportButton } from "@/components/analytics/ExportButton";
import { ReportBuilder } from "@/components/analytics/ReportBuilder";
import { ForecastDashboard } from "@/components/analytics/ForecastDashboard";
import { BenchmarkComparison } from "@/components/analytics/BenchmarkComparison";
import { CashflowChart } from "@/components/insights/CashflowChart";
import { ScenarioPlayground } from "@/components/insights/ScenarioPlayground";
import { BehavioralInsightsPanel } from "@/components/ai/BehavioralInsightsPanel";
import { SpendingHeatmapMap } from "@/components/analytics/SpendingHeatmapMap";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import { Map } from "lucide-react";

function AnalyticsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [forecastDays, setForecastDays] = useState(30);
  const navigate = useNavigate();
  
  const { 
    data: analyticsData, 
    isLoading: isAnalyticsLoading,
  } = useAnalyticsData(timeframe);
  
  const { 
    data: insightsData, 
    isLoading: isInsightsLoading,
    refetch: refetchInsights,
    isFetching: isRefreshingInsights,
  } = useAIInsights(timeframe);

  // Cash flow forecast data
  const { data: forecast, isLoading: forecastLoading } = useQuery({
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

  const { mutate: seedSampleData, isPending: isSeeding } = useSeedSampleData();

  const hasNoData = !isAnalyticsLoading && (!analyticsData?.transactionCount || analyticsData.transactionCount === 0);

  const exportData = {
    title: "Financial Analytics Report",
    headers: ["Category", "Amount", "Percentage", "Trend"],
    rows: analyticsData?.categoryTotals.map(cat => [
      cat.category,
      `$${cat.amount.toFixed(2)}`,
      `${cat.percentage.toFixed(1)}%`,
      "—",
    ]) || [],
    summary: [
      { label: "Total Spending", value: `$${analyticsData?.totalSpending.toFixed(2) || '0'}` },
      { label: "Period", value: timeframe === '7d' ? 'Last 7 days' : timeframe === '30d' ? 'Last 30 days' : timeframe === '90d' ? 'Last 90 days' : timeframe === '6m' ? 'Last 6 months' : 'Last year' },
      { label: "Transactions", value: String(analyticsData?.transactionCount || 0) },
    ],
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/transactions?category=${encodeURIComponent(category)}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="text-muted-foreground mt-1">
              Track spending, forecasts, and AI-powered financial insights
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button asChild variant="outline" size="sm">
              <Link to="/income">
                <DollarSign className="w-4 h-4 mr-1" />
                Income
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/net-worth">
                <TrendingUp className="w-4 h-4 mr-1" />
                Net Worth
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/spending-reports">
                <ReceiptText className="w-4 h-4 mr-2" />
                Reports
              </Link>
            </Button>
            <TimeframePicker value={timeframe} onChange={setTimeframe} />
            <ExportButton data={exportData} />
          </div>
        </div>

        {/* Empty State with Seed Data Option */}
        {hasNoData && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Transaction Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect a bank account or generate sample data to see your analytics dashboard in action.
            </p>
            <Button 
              onClick={() => seedSampleData()} 
              disabled={isSeeding}
              className="gap-2"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Sample Data
                </>
              )}
            </Button>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Heatmap</span>
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Cash Flow</span>
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Forecasts</span>
            </TabsTrigger>
            <TabsTrigger value="behavioral" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Behavioral</span>
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="gap-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">What-If</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <SpendingOverviewCards
              totalSpending={analyticsData?.totalSpending || 0}
              transactionCount={analyticsData?.transactionCount || 0}
              topCategory={analyticsData?.topCategory || 'None'}
              averageTransaction={analyticsData?.averageTransaction || 0}
              spendingChange={analyticsData?.spendingChange || 0}
              transactionChange={analyticsData?.transactionChange || 0}
              dailyData={analyticsData?.dailyData || []}
              isLoading={isAnalyticsLoading}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <SpendingTrendsChart
                data={analyticsData?.dailyData || []}
                isLoading={isAnalyticsLoading}
              />
              <CategoryBreakdownChart
                data={analyticsData?.categoryTotals || []}
                isLoading={isAnalyticsLoading}
                onCategoryClick={handleCategoryClick}
              />
            </div>

            <PredictiveInsightsPanel
              insights={insightsData?.insights || []}
              isLoading={isInsightsLoading}
              onRefresh={() => refetchInsights()}
              isRefreshing={isRefreshingInsights}
            />
          </TabsContent>

          {/* Spending Heatmap Tab */}
          <TabsContent value="heatmap" className="space-y-4">
            <SpendingHeatmapMap />
          </TabsContent>

          {/* Cash Flow Tab (from Insights) */}
          <TabsContent value="cashflow" className="space-y-4">
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

          {/* Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-6">
            <ForecastDashboard />
            <SpendingComparison
              monthlyData={analyticsData?.monthlyData || []}
              isLoading={isAnalyticsLoading}
            />
            <BenchmarkComparison />
          </TabsContent>

          {/* Behavioral Insights Tab (from Insights) */}
          <TabsContent value="behavioral">
            <BehavioralInsightsPanel />
          </TabsContent>

          {/* Scenarios Tab (from Insights) */}
          <TabsContent value="scenarios">
            <ScenarioPlayground />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <ReportBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withPageErrorBoundary(withPageMemo(AnalyticsPage, 'Analytics'), 'Analytics');
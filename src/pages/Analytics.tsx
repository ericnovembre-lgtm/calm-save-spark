import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, PieChart, FileText } from "lucide-react";
import { useAnalyticsData, useAIInsights, type Timeframe } from "@/hooks/useAnalyticsData";
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
import { useNavigate } from "react-router-dom";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
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

  // Prepare export data
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
    // Navigate to transactions filtered by category
    navigate(`/transactions?category=${encodeURIComponent(category)}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track spending trends, categories, and AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TimeframePicker value={timeframe} onChange={setTimeframe} />
            <ExportButton data={exportData} />
          </div>
        </div>

        {/* Overview Cards */}
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

        {/* Charts Row */}
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

        {/* AI Insights */}
        <PredictiveInsightsPanel
          insights={insightsData?.insights || []}
          isLoading={isInsightsLoading}
          onRefresh={() => refetchInsights()}
          isRefreshing={isRefreshingInsights}
        />

        {/* Detailed Tabs */}
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Forecasts</span>
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Benchmarks</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-6">
            <SpendingComparison
              monthlyData={analyticsData?.monthlyData || []}
              isLoading={isAnalyticsLoading}
            />
          </TabsContent>

          <TabsContent value="forecasts" className="mt-6">
            <ForecastDashboard />
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-6">
            <BenchmarkComparison />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

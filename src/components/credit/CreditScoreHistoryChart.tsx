import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Activity } from "lucide-react";
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "@/components/charts/LazyLineChart";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import { useCreditScoreHistory, DateRange } from "@/hooks/useCreditScoreHistory";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const CreditScoreHistoryChart = () => {
  const [dateRange, setDateRange] = useState<DateRange>('6m');
  const { data: historyData, isLoading } = useCreditScoreHistory(dateRange);

  const dateRangeLabels: Record<DateRange, string> = {
    '30d': '30 Days',
    '90d': '90 Days',
    '6m': '6 Months',
    '1y': '1 Year',
    'all': 'All Time',
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Credit Score History
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Track your credit score over time</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No credit score history available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Sync your credit score to start tracking.</p>
        </div>
      </Card>
    );
  }

  const minScore = Math.min(...historyData.map(d => d.score));
  const maxScore = Math.max(...historyData.map(d => d.score));
  const scoreChange = historyData[historyData.length - 1].score - historyData[0].score;
  const scoreChangePercent = ((scoreChange / historyData[0].score) * 100).toFixed(1);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Credit Score History
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Track your credit score over time</p>
          
          {historyData.length > 1 && (
            <div className="flex items-center gap-2 mt-3">
              <div className={`flex items-center gap-1 text-sm font-medium ${
                scoreChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${scoreChange < 0 ? 'rotate-180' : ''}`} />
                <span>{scoreChange >= 0 ? '+' : ''}{scoreChange} pts</span>
                <span className="text-muted-foreground">
                  ({scoreChange >= 0 ? '+' : ''}{scoreChangePercent}%)
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                over {dateRangeLabels[dateRange].toLowerCase()}
              </span>
            </div>
          )}
        </div>
        
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <TabsList>
            <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs">90D</TabsTrigger>
            <TabsTrigger value="6m" className="text-xs">6M</TabsTrigger>
            <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">ALL</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ChartWrapper delay={0.2}>
        <LazyLineChart data={historyData} height={300}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            domain={[Math.max(300, minScore - 20), Math.min(850, maxScore + 20)]}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LazyLineChart>
      </ChartWrapper>
    </Card>
  );
};

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSpendingReports, TimeRange } from '@/hooks/useSpendingReports';
import { useSpendingComparison } from '@/hooks/useSpendingComparison';
import { useSpendingHeatmap } from '@/hooks/useSpendingHeatmap';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, TrendingDown, ArrowRight, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

export default function SpendingReports() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { data, isLoading } = useSpendingReports(timeRange);
  const { data: comparison } = useSpendingComparison(6);
  const { data: heatmap } = useSpendingHeatmap(90);
  
  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6" data-copilot-id="spending-reports-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Spending Reports</h1>
              <p className="text-sm text-muted-foreground">Analyze your spending patterns</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-1 p-1 bg-muted/30 rounded-lg border border-border">
            {TIME_RANGES.map(range => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange(range.value)}
                className={cn(
                  "h-8 px-3",
                  timeRange === range.value && "bg-background shadow-sm"
                )}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Hero Stats */}
        {isLoading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">${data.totalSpending.toFixed(0)}</p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                data.changePercent > 0 ? "text-destructive" : "text-emerald-500"
              )}>
                {data.changePercent > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(data.changePercent).toFixed(1)}% vs last period
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold text-foreground">{data.transactionCount}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Avg Transaction</p>
              <p className="text-2xl font-bold text-foreground">${data.averageTransaction.toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold text-foreground">{data.categoryBreakdown.length}</p>
            </div>
          </div>
        )}
        
        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Breakdown Pie */}
          {isLoading ? (
            <Skeleton className="h-80 rounded-2xl" />
          ) : data && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown.slice(0, 6)}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {data.categoryBreakdown.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(0)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {data.categoryBreakdown.slice(0, 6).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{cat.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Monthly Comparison */}
          {comparison && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparison}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(0)}`} />
                  <Bar dataKey="spending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        {/* Top Merchants */}
        {data && data.topMerchants.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Top Merchants</h3>
            <div className="space-y-3">
              {data.topMerchants.slice(0, 5).map((merchant, i) => (
                <div key={merchant.merchant} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{merchant.merchant}</p>
                      <p className="text-xs text-muted-foreground">{merchant.transactionCount} transactions</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">${merchant.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

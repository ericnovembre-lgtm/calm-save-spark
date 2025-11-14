import { useState } from "react";
import { TrendingUp, Target, Percent, DollarSign, Download, Mail, Printer, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCard } from "./MetricsCard";
import { toast } from "sonner";

interface AdvancedAnalyticsDashboardProps {
  data?: {
    savingsRate: number;
    monthlyGrowth: number;
    goalCompletionRate: number;
    topCategories: Array<{ name: string; amount: number }>;
  };
}

export function AdvancedAnalyticsDashboard({ data }: AdvancedAnalyticsDashboardProps) {
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  // Mock data for demonstration
  const mockData = data || {
    savingsRate: 15.5,
    monthlyGrowth: 8.2,
    goalCompletionRate: 75,
    topCategories: [
      { name: 'Housing', amount: 1200 },
      { name: 'Food', amount: 600 },
      { name: 'Transport', amount: 400 },
    ]
  };

  const metrics = [
    {
      title: 'Savings Rate',
      value: mockData.savingsRate,
      change: 2.5,
      trend: [12, 13, 14, 15, 15.5, 16, 15.5],
      icon: Percent,
      color: 'text-green-600',
      format: 'percentage' as const
    },
    {
      title: 'Monthly Growth',
      value: mockData.monthlyGrowth,
      change: 1.8,
      trend: [6, 6.5, 7, 7.5, 8, 8.5, 8.2],
      icon: TrendingUp,
      color: 'text-blue-600',
      format: 'percentage' as const
    },
    {
      title: 'Goal Completion',
      value: mockData.goalCompletionRate,
      change: -5,
      trend: [80, 78, 75, 77, 75, 76, 75],
      icon: Target,
      color: 'text-purple-600',
      format: 'percentage' as const
    },
    {
      title: 'Top Category',
      value: `$${mockData.topCategories[0]?.amount || 0}`,
      change: 3.2,
      trend: [1100, 1150, 1180, 1190, 1200, 1220, 1200],
      icon: DollarSign,
      color: 'text-orange-600',
      format: 'currency' as const
    },
  ];

  const handleExport = (format: 'pdf' | 'csv' | 'email' | 'print') => {
    const messages = {
      pdf: 'Generating PDF report...',
      csv: 'Exporting to CSV...',
      email: 'Sending report via email...',
      print: 'Preparing print view...'
    };

    toast.success(messages[format], {
      description: 'This feature will be available soon'
    });

    // In a real implementation, you would:
    // - PDF: Use jspdf or puppeteer
    // - CSV: Convert data to CSV format and trigger download
    // - Email: Call backend to send report
    // - Print: Open print dialog with formatted content
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Key performance indicators and insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'year')}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-1 ml-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport('pdf')}
              title="Export as PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport('email')}
              title="Email report"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport('print')}
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport('csv')}
              title="Export as CSV"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Comparative Analysis */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-display font-semibold mb-4">
          Comparative Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Month-over-Month</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">+12.5%</span>
              <span className="text-sm text-green-600">↑ 2.3%</span>
            </div>
            <p className="text-xs text-muted-foreground">vs Previous Month</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Year-over-Year</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">+45.8%</span>
              <span className="text-sm text-green-600">↑ 8.1%</span>
            </div>
            <p className="text-xs text-muted-foreground">vs Last Year</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Projected vs Actual</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">98%</span>
              <span className="text-sm text-orange-600">↓ 2%</span>
            </div>
            <p className="text-xs text-muted-foreground">On Track</p>
          </div>
        </div>
      </Card>

      {/* Top Categories */}
      <div className="mt-6">
        <h3 className="text-lg font-display font-semibold mb-4">
          Top Spending Categories
        </h3>
        <div className="space-y-3">
          {mockData.topCategories.map((category, index) => {
            const total = mockData.topCategories.reduce((sum, c) => sum + c.amount, 0);
            const percentage = (category.amount / total) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${category.amount.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

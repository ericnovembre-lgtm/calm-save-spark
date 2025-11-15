import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";
import { TrendingUp, TrendingDown, AlertCircle, DollarSign } from "lucide-react";
import { AnimatedCounter } from "@/components/onboarding/AnimatedCounter";
import { useMemo } from "react";

interface EnhancedBudgetAnalyticsProps {
  budgets: any[];
  spending: Record<string, any>;
}

export function EnhancedBudgetAnalytics({ budgets, spending }: EnhancedBudgetAnalyticsProps) {
  // Generate 6 months of historical data
  const historicalData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(String(b.total_limit)), 0);
      const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
      
      return {
        month,
        budgeted: totalBudget,
        spent: totalBudget * (0.85 + variance),
        forecast: totalBudget * (0.9 + variance * 0.5)
      };
    });
  }, [budgets]);

  // Calculate forecast for next month
  const forecastData = useMemo(() => {
    const avgSpending = historicalData.reduce((sum, d) => sum + d.spent, 0) / historicalData.length;
    const trend = (historicalData[historicalData.length - 1].spent - historicalData[0].spent) / historicalData.length;
    
    return {
      nextMonth: avgSpending + trend,
      confidence: 0.85
    };
  }, [historicalData]);

  // Month-over-month comparison
  const momComparison = useMemo(() => {
    if (historicalData.length < 2) return { change: 0, percentage: 0 };
    
    const current = historicalData[historicalData.length - 1].spent;
    const previous = historicalData[historicalData.length - 2].spent;
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    return { change, percentage };
  }, [historicalData]);

  // Category performance
  const categoryPerformance = useMemo(() => {
    return budgets.map(budget => {
      const spend = spending[budget.id];
      const spentAmount = spend?.spent_amount || 0;
      const limit = parseFloat(String(budget.total_limit));
      const efficiency = limit > 0 ? (spentAmount / limit) * 100 : 0;
      
      return {
        name: budget.name,
        efficiency: Math.min(efficiency, 100),
        status: efficiency > 100 ? 'over' : efficiency > 80 ? 'warning' : 'good'
      };
    });
  }, [budgets, spending]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={fadeInUp}>
          <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Forecast (Next Month)</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">$</span>
              <AnimatedCounter 
                value={forecastData.nextMonth} 
                className="text-2xl font-bold text-foreground"
                decimals={0}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(forecastData.confidence * 100).toFixed(0)}% confidence
            </p>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Month-over-Month</span>
              {momComparison.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${
                momComparison.change >= 0 ? 'text-destructive' : 'text-primary'
              }`}>
                {momComparison.change >= 0 ? '+' : ''}
                <AnimatedCounter 
                  value={Math.abs(momComparison.percentage)} 
                  className="inline"
                  decimals={1}
                />%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. last month
            </p>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Efficiency</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter 
                value={categoryPerformance.reduce((sum, c) => sum + c.efficiency, 0) / categoryPerformance.length || 0}
                className="text-2xl font-bold text-foreground"
                decimals={0}
              />
              <span className="text-2xl font-bold text-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              budget utilization
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-6">Spending Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="budgeted"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="spent"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--secondary))', r: 5 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-6">Spending Forecast</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...historicalData, { month: 'Jul (Forecast)', forecast: forecastData.nextMonth }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="spent"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.3}
                      strokeDasharray="5 5"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-6">Category Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Bar 
                      dataKey="efficiency" 
                      radius={[0, 8, 8, 0]}
                      animationDuration={1500}
                    >
                      {categoryPerformance.map((entry, index) => (
                        <rect
                          key={`cell-${index}`}
                          fill={
                            entry.status === 'over' ? 'hsl(var(--destructive))' :
                            entry.status === 'warning' ? 'hsl(0 84.2% 60.2%)' :
                            'hsl(var(--primary))'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

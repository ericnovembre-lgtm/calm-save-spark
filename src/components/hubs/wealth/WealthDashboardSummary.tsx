import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { TrendingUp, TrendingDown, Lightbulb, DollarSign, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { useGenerativeInsights } from "@/hooks/useGenerativeInsights";
import { useRealtimeMarketData } from "@/hooks/useRealtimeMarketData";
import { supabase } from "@/integrations/supabase/client";
import CountUp from "react-countup";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";

export function WealthDashboardSummary() {
  const prefersReducedMotion = useReducedMotion();
  const [userId, setUserId] = useState<string>('');
  const { data: netWorthData, isLoading: isNetWorthLoading } = useNetWorthData();
  const { insights, isLoading: isInsightsLoading } = useGenerativeInsights(userId);
  const { data: marketData } = useRealtimeMarketData();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  if (isNetWorthLoading) {
    return (
      <Card className="border-2 p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </Card>
    );
  }

  const isPositiveTrend = (netWorthData?.monthlyChange || 0) >= 0;
  const wealthInsights = insights.filter(i => i.type === 'trend' || i.type === 'tip').slice(0, 3);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="border-2 p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Wealth Dashboard</h3>
            <p className="text-sm text-muted-foreground">Your complete financial snapshot</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Net Worth */}
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
          >
            <div className="text-sm text-muted-foreground mb-1">Net Worth</div>
            <div className="text-3xl font-bold text-foreground">
              $<CountUp end={netWorthData?.currentNetWorth || 0} duration={1.5} separator="," decimals={0} />
            </div>
            <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Monthly Change */}
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
            className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20"
          >
            <div className="text-sm text-muted-foreground mb-1">This Month</div>
            <div className="flex items-center gap-2">
              {isPositiveTrend ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-2xl font-bold ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(netWorthData?.monthlyChange || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {isPositiveTrend ? '+' : ''}{netWorthData?.monthlyChangePercent.toFixed(1)}% growth
            </div>
          </motion.div>

          {/* YTD Trend */}
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
            className="p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20"
          >
            <div className="text-sm text-muted-foreground mb-1">Year to Date</div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">
                {netWorthData?.ytdChangePercent >= 0 ? '+' : ''}{netWorthData?.ytdChangePercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {netWorthData?.ytdChange >= 0 ? 'Excellent' : 'Needs attention'}
            </div>
          </motion.div>
        </div>

        {/* Growth Trend Chart */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">6-Month Growth Trend</h4>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthData?.trendData || []}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#netWorthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Market Indices */}
        {marketData && marketData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Live Market Indices</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {marketData.slice(0, 5).map((market) => (
                <motion.div
                  key={market.symbol}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="text-xs text-muted-foreground">{market.symbol}</div>
                  <div className="text-lg font-bold">${market.price.toFixed(2)}</div>
                  <div className={`text-xs flex items-center gap-1 ${market.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {market.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {market.changePercent.toFixed(2)}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Insights */}
        {!isInsightsLoading && wealthInsights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Personalized Insights</h4>
            </div>
            <div className="space-y-2">
              {wealthInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <p className="text-sm text-foreground flex-1">{insight.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

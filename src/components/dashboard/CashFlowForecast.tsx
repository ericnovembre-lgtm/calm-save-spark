import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "@/components/charts/LazyAreaChart";
import { TrendingUp, Calendar } from "lucide-react";
import { addDays, format, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WidgetHelpTooltip } from "@/components/dashboard/WidgetHelpTooltip";
import { WIDGET_HELP_CONTENT } from "@/data/widgetHelpContent";
import { DashboardWidgetCard } from "@/components/dashboard/DashboardWidgetCard";

interface CashFlowForecastProps {
  userId: string;
}

const CashFlowForecast = ({ userId }: CashFlowForecastProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { data: transactions } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(90);
      if (error) throw error;
      return data;
    },
  });

  const { data: scheduledTransfers } = useQuery({
    queryKey: ['scheduled_transfers', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_transfers')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Calculate average daily spending from past transactions
  const avgDailySpending = transactions
    ? Math.abs(transactions
        .filter(t => parseFloat(String(t.amount)) < 0)
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)) / 30
    : 50;

  // Calculate average daily income
  const avgDailyIncome = transactions
    ? transactions
        .filter(t => parseFloat(String(t.amount)) > 0)
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) / 30
    : 100;

  // Generate forecast for next 30 days
  const today = new Date();
  const forecastDays = eachDayOfInterval({
    start: today,
    end: addDays(today, 30)
  });

  let runningBalance = transactions?.length 
    ? transactions.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)
    : 1000;

  const forecastData = forecastDays.map((day, index) => {
    // Add expected income (assuming weekly income)
    if (index % 7 === 0 && index > 0) {
      runningBalance += avgDailyIncome * 7;
    }

    // Subtract daily spending
    runningBalance -= avgDailySpending;

    // Add scheduled transfers
    const dayTransfers = scheduledTransfers?.filter(st => {
      const nextDate = new Date(st.next_transfer_date);
      return format(nextDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    }) || [];

    dayTransfers.forEach(st => {
      runningBalance -= parseFloat(String(st.amount));
    });

    return {
      date: format(day, 'MMM d'),
      balance: Math.round(runningBalance),
      projected: Math.round(runningBalance + (avgDailyIncome * (30 - index) / 30) - (avgDailySpending * (30 - index) / 30)),
    };
  });

  const endBalance = forecastData[forecastData.length - 1]?.balance || 0;
  const startBalance = forecastData[0]?.balance || 0;
  const trend = endBalance - startBalance;

  // Custom Glass Tooltip Component
  const GlassTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-2xl bg-card/90 border border-white/20 rounded-xl p-3 shadow-[0_8px_32px_-8px_hsla(var(--primary),0.2)]"
      >
        <p className="text-xs font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">
              ${entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <WidgetHelpTooltip content={WIDGET_HELP_CONTENT.cashFlowForecast}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DashboardWidgetCard 
          lastUpdated="just now"
          secondaryContent={
            <p className="text-xs text-muted-foreground">
              Based on 90 days of transaction history
            </p>
          }
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                30-Day Cash Flow Forecast
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Projected balance based on your spending patterns
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                ${Math.abs(endBalance).toLocaleString()}
              </p>
              <p className={`text-sm flex items-center gap-1 justify-end ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4" />
                {trend >= 0 ? '+' : ''}{trend.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="h-48 md:h-64">
            <LazyAreaChart data={forecastData} height={256} className="h-full">
              <defs>
                {/* Liquid Gradient - Primary Balance */}
                <linearGradient id="liquidBalanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5}/>
                  <stop offset="30%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="70%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
                {/* Liquid Gradient - Projected */}
                <linearGradient id="liquidProjectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                {/* Glow filter for line */}
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={8}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<GlassTooltip />} />
              <Legend />
              {/* Primary Balance Line with Draw Animation */}
              <Area
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3}
                fill="url(#liquidBalanceGradient)"
                name="Expected Balance"
                animationDuration={prefersReducedMotion ? 0 : 2000}
                animationEasing="ease-out"
                style={{
                  filter: 'url(#lineGlow)',
                }}
              />
              {/* Projected Scenario */}
              <Area
                type="monotone" 
                dataKey="projected" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                strokeDasharray="8 4"
                fill="url(#liquidProjectedGradient)"
                name="Optimistic Scenario"
                animationDuration={prefersReducedMotion ? 0 : 2500}
                animationEasing="ease-out"
              />
            </LazyAreaChart>
          </div>
        </DashboardWidgetCard>
      </motion.div>
    </WidgetHelpTooltip>
  );
}

export default CashFlowForecast;

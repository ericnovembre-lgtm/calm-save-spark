import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "@/components/charts/LazyAreaChart";
import { TrendingUp, Calendar } from "lucide-react";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WidgetHelpTooltip } from "@/components/dashboard/WidgetHelpTooltip";
import { WIDGET_HELP_CONTENT } from "@/data/widgetHelpContent";

interface CashFlowForecastProps {
  userId: string;
}

function CashFlowForecast({ userId }: CashFlowForecastProps) {
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

  return (
    <WidgetHelpTooltip content={WIDGET_HELP_CONTENT.cashFlowForecast}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
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
              <linearGradient id="balanceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="projectedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)'
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  balance: 'Expected Balance',
                  projected: 'Optimistic Scenario'
                };
                return [`$${value.toLocaleString()}`, labels[name] || name];
              }}
            />
            <Legend />
            <Area
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fill="url(#balanceAreaGradient)"
              name="Expected Balance"
              animationDuration={prefersReducedMotion ? 0 : 1000}
              animationEasing="ease-out"
            />
            <Area
              type="monotone" 
              dataKey="projected" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#projectedAreaGradient)"
              name="Optimistic Scenario"
              animationDuration={prefersReducedMotion ? 0 : 1200}
              animationEasing="ease-out"
            />
          </LazyAreaChart>
        </div>
      </Card>
    </motion.div>
    </WidgetHelpTooltip>
  );
}

// Export both named and default for ESM compatibility
export { CashFlowForecast };
export default CashFlowForecast;

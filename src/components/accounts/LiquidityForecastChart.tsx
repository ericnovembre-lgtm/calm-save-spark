import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChartWrapper } from '@/components/ui/chart-wrapper';

interface ForecastPoint {
  date: string;
  safeToSpend: number;
  expectedSpending: number;
  bills: number;
  income: number;
}

interface LiquidityForecastChartProps {
  demoForecast?: ForecastPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">
          {format(new Date(data.date), 'MMM dd, yyyy')}
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Safe to Spend:</span>
            <span className="font-semibold text-success">${data.safeToSpend.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Expected Spending:</span>
            <span className="text-destructive">-${data.expectedSpending.toFixed(2)}</span>
          </div>
          {data.bills > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Bills Due:</span>
              <span className="text-warning">-${data.bills.toFixed(2)}</span>
            </div>
          )}
          {data.income > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Income:</span>
              <span className="text-success">+${data.income.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const LiquidityForecastChart = ({ demoForecast }: LiquidityForecastChartProps = {}) => {
  const { data: forecastData, isLoading } = useQuery({
    queryKey: ['liquidity-forecast'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-liquidity-forecast');
      if (error) throw error;
      return data.forecast as ForecastPoint[];
    },
    staleTime: 60 * 60 * 1000, // Cache 1 hour
    enabled: !demoForecast, // Don't fetch if demo data is provided
  });

  const forecast = demoForecast || forecastData;

  if (isLoading && !demoForecast) {
    return (
      <ChartWrapper delay={0.2}>
        <div className="bg-card rounded-2xl p-6 shadow-glass border border-glass-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">90-Day Liquidity Forecast</h3>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted/30 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-muted/20 rounded-full w-1/2 animate-pulse" />
            <div className="h-48 bg-muted/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </ChartWrapper>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-glass border border-glass-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">90-Day Liquidity Forecast</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Connect accounts to see your forecast</p>
        </div>
      </div>
    );
  }

  return (
    <ChartWrapper delay={0.2}>
      <motion.div 
        className="bg-card rounded-2xl p-6 shadow-glass border border-glass-border hover:shadow-glass-elevated transition-shadow duration-300"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">90-Day Liquidity Forecast</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Projected safe-to-spend based on your patterns
          </p>
        </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="safeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}`}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="safeToSpend" 
            stroke="hsl(142 76% 36%)" 
            strokeWidth={2}
            fill="url(#safeGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      
        <motion.div 
          className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success shadow-sm" />
            <span>Safe to Spend</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>Based on spending patterns, bills, and income</span>
        </motion.div>
      </motion.div>
    </ChartWrapper>
  );
};

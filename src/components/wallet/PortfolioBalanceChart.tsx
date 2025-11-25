import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Loader2, Activity } from 'lucide-react';
import { LazyAreaChart, Area, XAxis, YAxis, Tooltip } from '@/components/charts/LazyAreaChart';
import { useWalletBalanceHistory, Timeframe } from '@/hooks/useWalletBalanceHistory';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { format } from 'date-fns';

interface PortfolioBalanceChartProps {
  walletId: string;
  currentBalance: number;
}

export function PortfolioBalanceChart({ walletId, currentBalance }: PortfolioBalanceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');
  const { data: history, isLoading } = useWalletBalanceHistory(walletId, timeframe);
  const prefersReducedMotion = useReducedMotion();

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

  // Calculate change
  const firstBalance = history?.[0]?.balance || currentBalance;
  const lastBalance = history?.[history.length - 1]?.balance || currentBalance;
  const absoluteChange = lastBalance - firstBalance;
  const percentChange = firstBalance > 0 ? (absoluteChange / firstBalance) * 100 : 0;
  const isPositive = absoluteChange >= 0;

  const formatXAxis = (date: Date) => {
    if (timeframe === '1D') return format(date, 'HH:mm');
    if (timeframe === '1W' || timeframe === '1M') return format(date, 'MMM d');
    return format(date, 'MMM yy');
  };

  return (
    <GlassPanel variant="default" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Portfolio Balance</h2>
            <p className="text-xs text-muted-foreground">Track your portfolio performance</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-xs rounded-lg transition-all ${
                timeframe === tf 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Change Indicator */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-baseline gap-3 mb-8"
      >
        <div className="flex items-center gap-2">
          {isPositive ? (
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
          )}
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}${Math.abs(absoluteChange).toFixed(2)}
              </span>
              <span className={`text-lg font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeframe === '1D' && 'Today'}
              {timeframe === '1W' && 'This week'}
              {timeframe === '1M' && 'This month'}
              {timeframe === '3M' && 'This quarter'}
              {timeframe === '1Y' && 'This year'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-72 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-72"
        >
          <LazyAreaChart
            data={history?.map(item => ({
              date: formatXAxis(item.date),
              balance: item.balance
            })) || []}
            height={288}
          >
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#balanceGradient)"
                animationDuration={prefersReducedMotion ? 0 : 1000}
                animationEasing="ease-out"
              />
            </LazyAreaChart>
        </motion.div>
      )}
    </GlassPanel>
  );
}

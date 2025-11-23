import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Flag, Mountain } from 'lucide-react';
import { ChartWrapper } from '@/components/ui/chart-wrapper';

interface DebtMountainVisualizerProps {
  simulation?: any[];
  debtFreeDate?: string;
  monthsToFreedom?: number;
  isLoading?: boolean;
}

export function DebtMountainVisualizer({ 
  simulation, 
  debtFreeDate,
  monthsToFreedom,
  isLoading 
}: DebtMountainVisualizerProps) {
  const chartData = useMemo(() => {
    if (!simulation || simulation.length === 0) return [];
    
    return simulation.map((month, index) => ({
      month: index,
      balance: month.remaining_balance || 0,
      label: index % 6 === 0 ? `${index}mo` : ''
    }));
  }, [simulation]);

  const maxBalance = useMemo(() => {
    return Math.max(...chartData.map(d => d.balance), 1);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-[300px] bg-muted rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <ChartWrapper>
      <Card className="p-6 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-emerald-500/20">
              <Mountain className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Debt Mountain</h3>
              <p className="text-sm text-muted-foreground">Your journey to financial freedom</p>
            </div>
          </div>

          {/* Freedom Flag */}
          {debtFreeDate && monthsToFreedom && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <Flag className="w-4 h-4 text-emerald-500" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Summit</p>
                <p className="text-sm font-bold text-emerald-500">
                  {monthsToFreedom} {monthsToFreedom === 1 ? 'month' : 'months'}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="debtMountainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(244, 63, 94)" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="rgb(245, 158, 11)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="label" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="rgb(244, 63, 94)"
                strokeWidth={2}
                fill="url(#debtMountainGradient)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summit Marker */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 flex items-center justify-center gap-2 text-emerald-500"
          >
            <Flag className="w-5 h-5" />
            <span className="text-sm font-semibold">Debt-Free Summit: {debtFreeDate || 'Calculating...'}</span>
          </motion.div>
        )}
      </Card>
    </ChartWrapper>
  );
}

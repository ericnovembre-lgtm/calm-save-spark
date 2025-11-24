import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { LazyAreaChart, Area, XAxis, YAxis, Tooltip } from '@/components/charts/LazyAreaChart';
import { useWalletBalanceHistory, Timeframe } from '@/hooks/useWalletBalanceHistory';
import { format } from 'date-fns';

interface PortfolioBalanceChartProps {
  walletId: string;
  currentBalance: number;
}

export function PortfolioBalanceChart({ walletId, currentBalance }: PortfolioBalanceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');
  const { data: history, isLoading } = useWalletBalanceHistory(walletId, timeframe);

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
    <Card className="p-6 bg-slate-900/50 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Portfolio Balance</h2>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 px-3 text-xs ${
                timeframe === tf 
                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Change Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}${Math.abs(absoluteChange).toFixed(2)}
        </span>
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
        </span>
        <span className="text-xs text-slate-400 ml-2">
          this {timeframe === '1D' ? 'day' : timeframe === '1W' ? 'week' : timeframe === '1M' ? 'month' : timeframe === '3M' ? 'quarter' : 'year'}
        </span>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="h-64">
          <LazyAreaChart
            data={history?.map(item => ({
              date: formatXAxis(item.date),
              balance: item.balance
            })) || []}
            height={256}
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#balanceGradient)"
            />
          </LazyAreaChart>
        </div>
      )}
    </Card>
  );
}

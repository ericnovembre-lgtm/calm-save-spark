import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { SentimentHistoryPoint } from '@/hooks/useSentimentHistory';

interface SentimentHistoryChartProps {
  data: SentimentHistoryPoint[] | undefined;
  isLoading: boolean;
  ticker: string;
  range: '7d' | '30d';
  onRangeChange: (range: '7d' | '30d') => void;
}

export function SentimentHistoryChart({ data, isLoading, ticker, range, onRangeChange }: SentimentHistoryChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-xs text-slate-400 mb-1">{formatDate(label)}</p>
          <p className="font-mono text-lg text-white">
            Score: <span className={point.score >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {point.score > 0 ? '+' : ''}{point.score}
            </span>
          </p>
          <p className="text-xs text-slate-500">
            Confidence: {Math.round(point.confidence * 100)}%
          </p>
          <p className="text-xs text-slate-500 capitalize">
            Volume: {point.volume}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            {ticker} Sentiment History
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={range === '7d' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onRangeChange('7d')}
            >
              7D
            </Button>
            <Button
              variant={range === '30d' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onRangeChange('30d')}
            >
              30D
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[200px]" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                domain={[-100, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                ticks={[-50, 0, 50]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="2 2" opacity={0.3} />
              <ReferenceLine y={-50} stroke="#ef4444" strokeDasharray="2 2" opacity={0.3} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#sentimentGradient)"
                dot={{ fill: '#22d3ee', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#22d3ee', strokeWidth: 2, stroke: '#fff', r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
            No historical data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

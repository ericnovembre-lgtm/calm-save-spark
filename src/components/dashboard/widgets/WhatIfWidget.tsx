import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { GitBranch, ArrowRight, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { WhatIfData } from '@/lib/ephemeral-widgets';

interface WhatIfWidgetProps {
  data: WhatIfData;
  title: string;
}

export function WhatIfWidget({ data, title }: WhatIfWidgetProps) {
  // Merge paths for chart
  const chartData = data.currentPath.map((current, index) => ({
    month: current.month,
    current: current.value,
    modified: data.modifiedPath[index]?.value || 0
  }));

  const isPositive = data.difference > 0;

  return (
    <div className="space-y-4">
      {/* Scenario header */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
        <GitBranch className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{data.scenarioName}</span>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Current Path</p>
          <p className="text-xl font-bold text-muted-foreground">
            $<CountUp end={data.currentPath[data.currentPath.length - 1]?.value || 0} duration={1} separator="," />
          </p>
        </div>
        <div className={cn(
          "p-3 rounded-lg border",
          isPositive ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
        )}>
          <p className={cn("text-xs mb-1", isPositive ? "text-emerald-500" : "text-rose-500")}>
            Modified Path
          </p>
          <p className={cn("text-xl font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>
            $<CountUp end={data.modifiedPath[data.modifiedPath.length - 1]?.value || 0} duration={1.5} separator="," />
          </p>
        </div>
      </div>

      {/* Difference highlight */}
      <motion.div
        className={cn(
          "flex items-center justify-center gap-3 py-3 rounded-lg",
          isPositive ? "bg-emerald-500/10" : "bg-rose-500/10"
        )}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ArrowRight className={cn("w-5 h-5", isPositive ? "text-emerald-500" : "text-rose-500")} />
        <div className="text-center">
          <p className={cn("text-2xl font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>
            {isPositive ? '+' : '-'}$<CountUp end={Math.abs(data.difference)} duration={1} separator="," />
          </p>
          <p className="text-xs text-muted-foreground">
            {isPositive ? 'more' : 'less'} by end of period ({data.percentChange > 0 ? '+' : ''}{data.percentChange.toFixed(1)}%)
          </p>
        </div>
      </motion.div>

      {/* Dual path chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`, 
                name === 'current' ? 'Current' : 'Modified'
              ]}
            />
            <Legend 
              formatter={(value) => value === 'current' ? 'Current Path' : 'Modified Path'}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="modified"
              stroke={isPositive ? 'hsl(142, 71%, 45%)' : 'hsl(var(--destructive))'}
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI insight */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{data.insight}</p>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';
import { ProjectionData } from '@/lib/ephemeral-widgets';

interface ProjectionWidgetProps {
  data: ProjectionData;
  title: string;
}

export function ProjectionWidget({ data, title }: ProjectionWidgetProps) {
  const growth = ((data.projectedValue - data.currentValue) / data.currentValue) * 100;

  return (
    <div className="space-y-4">
      {/* Current vs Projected */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="text-2xl font-bold">
            $<CountUp end={data.currentValue} duration={1} separator="," />
          </p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary mb-1">Projected</p>
          <p className="text-2xl font-bold text-primary">
            $<CountUp end={data.projectedValue} duration={1.5} separator="," />
          </p>
        </div>
      </div>

      {/* Growth indicator */}
      <div className={cn(
        "flex items-center justify-center gap-2 py-2 rounded-lg",
        growth >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
      )}>
        <TrendingUp className={cn(
          "w-5 h-5",
          growth >= 0 ? "text-emerald-500" : "text-rose-500 rotate-180"
        )} />
        <span className={cn(
          "text-xl font-bold",
          growth >= 0 ? "text-emerald-500" : "text-rose-500"
        )}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </span>
        <span className="text-sm text-muted-foreground">growth rate</span>
      </div>

      {/* Timeline chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.timeline}>
            <defs>
              <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
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
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#projectionGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence range */}
      {data.timeline.some(t => t.confidence) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence range shown</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {data.timeline.length} months forecast
          </span>
        </div>
      )}

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

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { ComparisonData } from '@/lib/ephemeral-widgets';

interface ComparisonWidgetProps {
  data: ComparisonData;
  title: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(var(--destructive))',
];

export function ComparisonWidget({ data, title }: ComparisonWidgetProps) {
  const maxValue = Math.max(...data.items.map(i => i.value));

  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-rose-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-emerald-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      {/* Period indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{data.period}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
          Side-by-side
        </span>
      </div>

      {/* Bar chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.items} layout="vertical">
            <XAxis 
              type="number" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              animationDuration={800}
            >
              {data.items.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 gap-3">
        {data.items.map((item, index) => (
          <motion.div
            key={item.name}
            className="p-3 rounded-lg bg-muted/50 border border-border/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <TrendIcon trend={item.trend} />
            </div>
            <p className="text-sm font-medium truncate">{item.name}</p>
            <p className="text-lg font-bold">${item.value.toFixed(0)}</p>
            {item.change !== undefined && (
              <p className={cn(
                "text-xs",
                item.change > 0 ? "text-rose-500" : item.change < 0 ? "text-emerald-500" : "text-muted-foreground"
              )}>
                {item.change > 0 ? '+' : ''}{item.change}% vs last period
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Ratio insight */}
      {data.items.length >= 2 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="text-2xl font-bold text-primary">
            {(data.items[0].value / data.items[1].value).toFixed(1)}x
          </span>
          <span className="text-sm text-muted-foreground">
            {data.items[0].name} vs {data.items[1].name}
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

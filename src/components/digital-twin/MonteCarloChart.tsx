import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

interface MonteCarloChartProps {
  timeline: Array<{
    year: number;
    age: number;
    median: number;
    p10: number;
    p90: number;
  }>;
}

export function MonteCarloChart({ timeline }: MonteCarloChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-xl bg-stone-900/90 backdrop-blur-xl border border-stone-700/50 p-6 shadow-[0_0_40px_hsl(var(--accent)/0.15)]"
    >
      {/* Subtle glow overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-stone-400">Projection Cone</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono text-stone-500">Monte Carlo</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="pessimisticGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="medianGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--accent))" />
                <stop offset="100%" stopColor="hsl(45, 90%, 60%)" />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(0, 0%, 100%)" 
              strokeOpacity={0.06}
              vertical={false}
            />
            <XAxis 
              dataKey="year" 
              tick={{ fill: 'hsl(0, 0%, 100%)', fillOpacity: 0.4, fontSize: 11, fontFamily: 'monospace' }}
              axisLine={{ stroke: 'hsl(0, 0%, 100%)', strokeOpacity: 0.1 }}
              tickLine={{ stroke: 'hsl(0, 0%, 100%)', strokeOpacity: 0.1 }}
            />
            <YAxis 
              tick={{ fill: 'hsl(0, 0%, 100%)', fillOpacity: 0.4, fontSize: 11, fontFamily: 'monospace' }}
              axisLine={{ stroke: 'hsl(0, 0%, 100%)', strokeOpacity: 0.1 }}
              tickLine={{ stroke: 'hsl(0, 0%, 100%)', strokeOpacity: 0.1 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={60}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  p90: 'Optimistic (90th)',
                  median: 'Expected (50th)',
                  p10: 'Pessimistic (10th)'
                };
                return [`$${value.toLocaleString()}`, labels[name] || name];
              }}
              labelFormatter={(label) => `Year ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(28, 15%, 10%)',
                border: '1px solid hsl(28, 15%, 25%)',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'white',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'white', opacity: 0.6, marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="p90"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={1.5}
              fill="url(#optimisticGradient)"
              name="p90"
            />
            <Area
              type="monotone"
              dataKey="p10"
              stroke="hsl(0, 70%, 50%)"
              strokeWidth={1.5}
              fill="url(#pessimisticGradient)"
              name="p10"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="url(#medianGradient)"
              strokeWidth={3}
              name="median"
              dot={false}
              style={{ filter: 'drop-shadow(0 0 6px hsl(var(--accent) / 0.5))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-8 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_hsl(142,76%,36%,0.5)]" />
            <span className="text-stone-400">Optimistic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full shadow-[0_0_8px_hsl(var(--accent)/0.5)]" />
            <span className="text-stone-400">Expected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-[0_0_8px_hsl(0,70%,50%,0.5)]" />
            <span className="text-stone-400">Pessimistic</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ProjectionConeProps {
  currentAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  months?: number;
  className?: string;
}

/**
 * Confidence interval fan chart showing goal projection
 */
export const ProjectionCone = ({ 
  currentAmount, 
  targetAmount,
  monthlyContribution,
  months = 12,
  className = '' 
}: ProjectionConeProps) => {
  // Generate projection data with confidence intervals
  const generateProjection = () => {
    const data = [];
    let current = currentAmount;
    
    for (let i = 0; i <= months; i++) {
      const expected = current + (monthlyContribution * i);
      const variance = expected * 0.15; // 15% variance
      
      data.push({
        month: i,
        expected,
        optimistic: expected + variance,
        pessimistic: expected - variance,
        target: targetAmount,
      });
    }
    
    return data;
  };

  const data = generateProjection();
  const finalExpected = data[data.length - 1].expected;
  const willReachTarget = finalExpected >= targetAmount;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null;

    return (
      <Card className="p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">
          Month {payload[0].payload.month}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-green-500">
            Optimistic: ${payload[0].payload.optimistic.toLocaleString()}
          </p>
          <p className="font-semibold">
            Expected: ${payload[0].payload.expected.toLocaleString()}
          </p>
          <p className="text-red-500">
            Pessimistic: ${payload[0].payload.pessimistic.toLocaleString()}
          </p>
        </div>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Goal Projection</h3>
          <div className={`text-sm font-semibold ${
            willReachTarget ? 'text-green-500' : 'text-yellow-500'
          }`}>
            {willReachTarget ? '✓ On Track' : '⚠ Needs Boost'}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Confidence cone */}
              <Area
                type="monotone"
                dataKey="optimistic"
                stroke="none"
                fill="url(#confidenceGradient)"
              />
              <Area
                type="monotone"
                dataKey="pessimistic"
                stroke="none"
                fill="url(#confidenceGradient)"
              />
              
              {/* Expected line */}
              <Line
                type="monotone"
                dataKey="expected"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              
              {/* Target line */}
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="font-semibold">${currentAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Projected</p>
            <p className="font-semibold">${finalExpected.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold">${targetAmount.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

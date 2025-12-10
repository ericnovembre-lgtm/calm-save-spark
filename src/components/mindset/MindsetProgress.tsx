import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useMoneyMindset } from '@/hooks/useMoneyMindset';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function MindsetProgress() {
  const { moodTrend } = useMoneyMindset();

  const chartData = moodTrend
    .slice(0, 14)
    .reverse()
    .map((item, index) => ({
      day: index + 1,
      mood: item.score,
      date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    }));

  const trend = moodTrend.length >= 2
    ? moodTrend[0].score - moodTrend[moodTrend.length - 1].score
    : 0;

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Mood Trends</h3>
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}</span>
          </div>
        )}
      </div>

      {chartData.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[150px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[1, 10]} 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="h-[150px] flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Record your mood to see trends</p>
        </div>
      )}
    </div>
  );
}

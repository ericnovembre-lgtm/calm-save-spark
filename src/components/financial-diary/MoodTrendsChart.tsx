import { Card } from '@/components/ui/card';
import { DiaryEntry, DiaryMood } from '@/hooks/useDiaryEntries';
import { useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const moodScores: Record<DiaryMood, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  stressed: 2,
  anxious: 1,
};

interface MoodTrendsChartProps {
  entries: DiaryEntry[];
}

export function MoodTrendsChart({ entries }: MoodTrendsChartProps) {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayEntries = entries.filter(e => e.entry_date === dateKey);
      
      let avgMood = null;
      if (dayEntries.length > 0) {
        const moodSum = dayEntries.reduce((sum, e) => {
          if (e.mood) return sum + moodScores[e.mood];
          if (e.mood_score) return sum + e.mood_score;
          return sum;
        }, 0);
        avgMood = moodSum / dayEntries.length;
      }

      return {
        date: format(date, 'MMM d'),
        mood: avgMood,
        entries: dayEntries.length,
      };
    });

    return last30Days;
  }, [entries]);

  const hasData = chartData.some(d => d.mood !== null);

  if (!hasData) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Mood Trends</h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Add diary entries with mood ratings to see trends
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Mood Trends (Last 30 Days)</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v) => ['😟', '😰', '😐', '🙂', '😊'][v - 1]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const data = payload[0].payload;
                  if (data.mood === null) return null;
                  return (
                    <div className="bg-popover border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium">{data.date}</p>
                      <p className="text-sm text-muted-foreground">
                        Mood: {data.mood?.toFixed(1)} / 5
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.entries} entries
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="mood"
              stroke="hsl(var(--primary))"
              fill="url(#moodGradient)"
              strokeWidth={2}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
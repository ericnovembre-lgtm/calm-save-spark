import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useMoneyMindset } from '@/hooks/useMoneyMindset';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export function MindsetCalendar() {
  const { entries } = useMoneyMindset();

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const entryDays = useMemo(() => {
    const map = new Map<string, { count: number; avgMood: number }>();
    
    entries.forEach(entry => {
      const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || { count: 0, avgMood: 0, totalMood: 0 };
      const newCount = existing.count + 1;
      const newTotalMood = (existing.avgMood * existing.count) + (entry.mood_score || 5);
      
      map.set(dateKey, {
        count: newCount,
        avgMood: newTotalMood / newCount,
      });
    });
    
    return map;
  }, [entries]);

  const getMoodColor = (avgMood: number): string => {
    if (avgMood >= 8) return 'bg-green-500';
    if (avgMood >= 6) return 'bg-emerald-400';
    if (avgMood >= 4) return 'bg-amber-400';
    if (avgMood >= 2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{format(today, 'MMMM yyyy')}</h3>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month start */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {daysInMonth.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayData = entryDays.get(dateKey);
          const isToday = isSameDay(day, today);

          return (
            <motion.div
              key={dateKey}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`aspect-square rounded-md flex items-center justify-center text-xs relative ${
                isToday ? 'ring-2 ring-primary' : ''
              } ${
                dayData ? getMoodColor(dayData.avgMood) : 'bg-muted/30'
              }`}
              title={dayData ? `${dayData.count} entries, avg mood: ${dayData.avgMood.toFixed(1)}` : undefined}
            >
              <span className={`${dayData ? 'text-white font-medium' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </span>
              {dayData && dayData.count > 1 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-primary-foreground text-[8px] rounded-full flex items-center justify-center">
                  {dayData.count}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-400" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

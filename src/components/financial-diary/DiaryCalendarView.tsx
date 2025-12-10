import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { DiaryEntry, DiaryMood } from '@/hooks/useDiaryEntries';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const moodColors: Record<DiaryMood, string> = {
  great: 'bg-green-500',
  good: 'bg-blue-500',
  neutral: 'bg-gray-400',
  stressed: 'bg-orange-500',
  anxious: 'bg-red-500',
};

interface DiaryCalendarViewProps {
  entries: DiaryEntry[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function DiaryCalendarView({ entries, selectedDate, onDateSelect }: DiaryCalendarViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>();
    entries.forEach(entry => {
      const dateKey = entry.entry_date;
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, entry]);
    });
    return map;
  }, [entries]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDayOfWeek = monthStart.getDay();

  return (
    <Card className="p-4">
      <div className="text-center mb-4">
        <h3 className="font-semibold">{format(selectedDate, 'MMMM yyyy')}</h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month start */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEntries = entriesByDate.get(dateKey) || [];
          const hasEntries = dayEntries.length > 0;
          const primaryMood = dayEntries[0]?.mood;
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={dateKey}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                transition-all hover:bg-secondary
                ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                ${isToday ? 'font-bold' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasEntries && (
                <div className="flex gap-0.5 mt-0.5">
                  {primaryMood && (
                    <div className={`w-1.5 h-1.5 rounded-full ${moodColors[primaryMood]}`} />
                  )}
                  {dayEntries.length > 1 && (
                    <span className="text-[8px] text-muted-foreground">+{dayEntries.length - 1}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {Object.entries(moodColors).map(([mood, color]) => (
          <div key={mood} className="flex items-center gap-1 text-xs">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="capitalize">{mood}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
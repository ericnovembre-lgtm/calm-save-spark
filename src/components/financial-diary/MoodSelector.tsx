import { DiaryMood } from '@/hooks/useDiaryEntries';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const moods: { value: DiaryMood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😊', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'anxious', emoji: '😟', label: 'Anxious' },
];

interface MoodSelectorProps {
  value: DiaryMood | null;
  onChange: (mood: DiaryMood) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {moods.map(mood => (
        <motion.button
          key={mood.value}
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(mood.value)}
          className={cn(
            'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
            value === mood.value
              ? 'border-primary bg-primary/10'
              : 'border-transparent bg-secondary hover:border-primary/30'
          )}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs font-medium">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
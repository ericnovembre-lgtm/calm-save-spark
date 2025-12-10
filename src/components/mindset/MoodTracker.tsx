import { motion } from 'framer-motion';

interface MoodTrackerProps {
  value: number;
  onChange: (value: number) => void;
}

const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😃', '🤩', '🥳'];

export function MoodTracker({ value, onChange }: MoodTrackerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">How do you feel about money today?</span>
        <span className="text-2xl">{moodEmojis[value - 1]}</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between mt-1 px-1">
          <span className="text-xs text-muted-foreground">Anxious</span>
          <span className="text-xs text-muted-foreground">Confident</span>
        </div>
      </div>

      <div className="flex justify-center gap-1 mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <motion.button
            key={num}
            onClick={() => onChange(num)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              num === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

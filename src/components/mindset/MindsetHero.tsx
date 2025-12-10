import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { useMoneyMindset } from '@/hooks/useMoneyMindset';

export function MindsetHero() {
  const { entries, averageMood, moodTrend } = useMoneyMindset();

  const totalEntries = entries.length;
  const streakDays = calculateStreak(entries.map(e => e.created_at));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 p-6 border border-violet-500/20"
      data-copilot-id="money-mindset-hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-400/10 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Brain className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Money Mindset</h1>
            <p className="text-muted-foreground">Reflect, grow, and transform your relationship with money</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Total Entries</span>
            </div>
            <p className="text-2xl font-bold">{totalEntries}</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Avg Mood</span>
            </div>
            <p className="text-2xl font-bold">
              {averageMood ? averageMood.toFixed(1) : '—'}/10
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Brain className="w-4 h-4" />
              <span className="text-sm">Streak</span>
            </div>
            <p className="text-2xl font-bold">{streakDays} days</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...dates]
    .map(d => new Date(d).toDateString())
    .filter((d, i, arr) => arr.indexOf(d) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 0; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    
    if (current.toDateString() === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

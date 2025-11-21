import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Heart, TrendingUp, AlertCircle, Smile, Meh, Frown } from 'lucide-react';

type Mood = 'confident' | 'neutral' | 'stressed';

interface MoodData {
  mood: Mood;
  score: number;
  factors: string[];
}

export function FinancialMoodTracker() {
  const [moodData, setMoodData] = useState<MoodData>({
    mood: 'confident',
    score: 75,
    factors: ['Emergency fund is healthy', 'On track with savings goals', 'No unusual spending']
  });

  useEffect(() => {
    // Simulate sentiment analysis
    const interval = setInterval(() => {
      const moods: Mood[] = ['confident', 'neutral', 'stressed'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      const score = randomMood === 'confident' ? 70 + Math.random() * 30 :
                    randomMood === 'neutral' ? 40 + Math.random() * 30 :
                    10 + Math.random() * 30;

      setMoodData({
        mood: randomMood,
        score,
        factors: [
          randomMood === 'confident' ? 'Strong savings momentum' : 
          randomMood === 'stressed' ? 'Multiple large expenses this week' : 
          'Average spending patterns',
          'Emergency fund status: Good',
          randomMood === 'stressed' ? 'Consider pausing non-essential spending' : 'Goal progress on track'
        ]
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getMoodIcon = () => {
    switch (moodData.mood) {
      case 'confident': return <Smile className="w-8 h-8" />;
      case 'neutral': return <Meh className="w-8 h-8" />;
      case 'stressed': return <Frown className="w-8 h-8" />;
    }
  };

  const getMoodColor = () => {
    switch (moodData.mood) {
      case 'confident': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'stressed': return 'text-red-500';
    }
  };

  const getMoodGradient = () => {
    switch (moodData.mood) {
      case 'confident': return 'from-green-500/20 to-transparent';
      case 'neutral': return 'from-yellow-500/20 to-transparent';
      case 'stressed': return 'from-red-500/20 to-transparent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Financial Mood</h3>
          <p className="text-sm text-muted-foreground">AI-analyzed sentiment</p>
        </div>
      </div>

      <div className={`relative rounded-3xl p-8 bg-gradient-to-br ${getMoodGradient()} border border-border/50`}>
        <div className="flex items-center justify-between mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={getMoodColor()}
          >
            {getMoodIcon()}
          </motion.div>
          <div className="text-right">
            <p className="text-4xl font-bold text-foreground">{Math.round(moodData.score)}</p>
            <p className="text-sm text-muted-foreground">Mood Score</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current State</p>
          <p className="text-2xl font-bold text-foreground capitalize">{moodData.mood}</p>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${moodData.score}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full ${
              moodData.mood === 'confident' ? 'bg-green-500' :
              moodData.mood === 'neutral' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Contributing Factors</p>
          {moodData.factors.map((factor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <TrendingUp className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{factor}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {moodData.mood === 'stressed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">AI Recommendation</p>
              <p className="text-sm text-muted-foreground">
                Consider taking a financial wellness break. Review your recent large expenses and
                adjust your budget if needed.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

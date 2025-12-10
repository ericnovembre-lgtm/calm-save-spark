import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

interface PulseInsightsProps {
  insights: string[];
}

export function PulseInsights({ insights }: PulseInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Your finances are looking stable! Keep up the good work.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl border border-border/50 bg-card p-6"
      data-copilot-id="pulse-insights"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{insight}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

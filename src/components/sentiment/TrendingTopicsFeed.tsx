import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Hash, Clock } from 'lucide-react';

interface TrendingTopicsFeedProps {
  topics: string[];
  isLoading: boolean;
}

export function TrendingTopicsFeed({ topics, isLoading }: TrendingTopicsFeedProps) {
  // Simulate timestamps (in production, these would come from the API)
  const getRelativeTime = (index: number) => {
    const minutes = [5, 12, 23, 45, 67, 89, 120][index % 7];
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Categorize topics (simplified logic)
  const getTopicCategory = (topic: string) => {
    const lower = topic.toLowerCase();
    if (lower.includes('ai') || lower.includes('chip') || lower.includes('tech')) return { label: 'Tech', color: 'bg-cyan-500/20 text-cyan-400' };
    if (lower.includes('fed') || lower.includes('rate') || lower.includes('inflation')) return { label: 'Macro', color: 'bg-violet-500/20 text-violet-400' };
    if (lower.includes('earnings') || lower.includes('revenue')) return { label: 'Earnings', color: 'bg-emerald-500/20 text-emerald-400' };
    if (lower.includes('crypto') || lower.includes('bitcoin')) return { label: 'Crypto', color: 'bg-orange-500/20 text-orange-400' };
    return { label: 'Market', color: 'bg-slate-500/20 text-slate-400' };
  };

  return (
    <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-slate-800/50 rounded animate-pulse" />
            ))}
          </div>
        ) : topics.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {topics.map((topic, index) => {
              const category = getTopicCategory(topic);
              return (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <Hash className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                      {topic}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${category.color}`}>
                        {category.label}
                      </Badge>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(index)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-500 text-sm py-8">
            No trending topics available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

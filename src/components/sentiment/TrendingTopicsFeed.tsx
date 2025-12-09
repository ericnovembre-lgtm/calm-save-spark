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
    if (lower.includes('ai') || lower.includes('chip') || lower.includes('tech')) return { label: 'Tech', color: 'bg-amber-500/20 text-amber-400' };
    if (lower.includes('fed') || lower.includes('rate') || lower.includes('inflation')) return { label: 'Macro', color: 'bg-yellow-500/20 text-yellow-400' };
    if (lower.includes('earnings') || lower.includes('revenue')) return { label: 'Earnings', color: 'bg-emerald-500/20 text-emerald-400' };
    if (lower.includes('crypto') || lower.includes('bitcoin')) return { label: 'Crypto', color: 'bg-orange-500/20 text-orange-400' };
    return { label: 'Market', color: 'bg-stone-500/20 text-stone-400' };
  };

  return (
    <Card className="bg-stone-900/80 border-white/10 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-stone-300 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-stone-800/50 rounded animate-pulse" />
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
                  className="flex items-start gap-3 p-3 rounded-lg bg-stone-800/30 hover:bg-stone-800/50 transition-colors cursor-pointer group"
                >
                  <Hash className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                      {topic}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${category.color}`}>
                        {category.label}
                      </Badge>
                      <span className="text-[10px] text-stone-500 flex items-center gap-1">
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
          <div className="text-center text-stone-500 text-sm py-8">
            No trending topics available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

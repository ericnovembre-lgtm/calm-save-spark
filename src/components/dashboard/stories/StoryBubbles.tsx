import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FinancialStory } from '@/hooks/useFinancialStories';

interface StoryBubblesProps {
  stories: FinancialStory[];
  onStoryClick: (index: number) => void;
  isViewed: (id: string) => boolean;
}

const STORY_ICONS: Record<FinancialStory['type'], string> = {
  high_five: '🙌',
  nudge: '⚠️',
  milestone: '🏆',
  goal_win: '🎯',
  spending_alert: '📊',
  streak: '🔥'
};

const THEME_GRADIENTS: Record<FinancialStory['theme'], string> = {
  emerald: 'from-emerald-400 to-emerald-600',
  rose: 'from-rose-400 to-rose-600',
  amber: 'from-amber-400 to-amber-600',
  gold: 'from-yellow-400 to-amber-500',
  violet: 'from-violet-400 to-violet-600',
  cyan: 'from-cyan-400 to-cyan-600'
};

export function StoryBubbles({ stories, onStoryClick, isViewed }: StoryBubblesProps) {
  if (stories.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-3 px-4 -mx-4">
      <motion.div 
        className="flex gap-3 min-w-min"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {stories.map((story, index) => {
          const viewed = isViewed(story.id);
          
          return (
            <motion.button
              key={story.id}
              onClick={() => onStoryClick(index)}
              className="relative flex-shrink-0 group"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Ring indicator */}
              <div className={cn(
                "w-16 h-16 rounded-full p-0.5",
                viewed 
                  ? "bg-muted-foreground/30" 
                  : `bg-gradient-to-br ${THEME_GRADIENTS[story.theme]}`
              )}>
                {/* Inner circle */}
                <div className={cn(
                  "w-full h-full rounded-full bg-background flex items-center justify-center",
                  "text-2xl transition-transform group-hover:scale-105"
                )}>
                  {STORY_ICONS[story.type]}
                </div>
              </div>
              
              {/* Unviewed dot */}
              {!viewed && (
                <motion.div
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full",
                    `bg-gradient-to-br ${THEME_GRADIENTS[story.theme]}`
                  )}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* Label */}
              <p className={cn(
                "text-[10px] mt-1 text-center truncate w-16",
                viewed ? "text-muted-foreground" : "text-foreground font-medium"
              )}>
                {story.type === 'high_five' ? 'Great Day!' :
                 story.type === 'nudge' ? 'Alert' :
                 story.type === 'milestone' ? 'Milestone' :
                 story.type === 'goal_win' ? 'Goal!' :
                 story.type === 'spending_alert' ? 'Budget' :
                 'Streak'}
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

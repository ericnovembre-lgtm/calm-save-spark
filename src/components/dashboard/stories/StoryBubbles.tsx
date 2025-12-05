import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FinancialStory } from '@/hooks/useFinancialStories';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StoryBubblesProps {
  stories: FinancialStory[];
  onStoryClick: (index: number) => void;
  isViewed: (id: string) => boolean;
}

const STORY_ICONS: Record<FinancialStory['type'], string> = {
  high_five: '🎉',
  nudge: '⚠️',
  milestone: '🏆',
  goal_win: '🎯',
  spending_alert: '📊',
  streak: '🔥'
};

const THEME_RING_CLASSES: Record<FinancialStory['theme'], string> = {
  emerald: 'story-ring-emerald',
  rose: 'story-ring-rose',
  amber: 'story-ring-amber',
  gold: 'story-ring-gold',
  violet: 'story-ring-violet',
  cyan: 'story-ring-cyan',
};

const THEME_GLOW_COLORS: Record<FinancialStory['theme'], string> = {
  emerald: 'hsla(160, 84%, 39%, 0.4)',
  rose: 'hsla(350, 89%, 60%, 0.4)',
  amber: 'hsla(38, 92%, 50%, 0.4)',
  gold: 'hsla(45, 93%, 47%, 0.4)',
  violet: 'hsla(258, 90%, 66%, 0.4)',
  cyan: 'hsla(189, 94%, 43%, 0.4)',
};

const THEME_DOT_COLORS: Record<FinancialStory['theme'], string> = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  gold: 'bg-yellow-500',
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const bubbleVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

export function StoryBubbles({ stories, onStoryClick, isViewed }: StoryBubblesProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (stories.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full overflow-x-auto scrollbar-hide py-3 px-4 -mx-4"
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="flex gap-4 min-w-min">
        {stories.map((story, index) => {
          const viewed = isViewed(story.id);
          const icon = STORY_ICONS[story.type];
          const ringClass = THEME_RING_CLASSES[story.theme];
          const glowColor = THEME_GLOW_COLORS[story.theme];
          const dotColor = THEME_DOT_COLORS[story.theme];
          
          return (
            <motion.button
              key={story.id}
              variants={bubbleVariants}
              onClick={() => onStoryClick(index)}
              whileHover={!prefersReducedMotion ? {
                scale: 1.08,
                y: -4,
                transition: { type: 'spring', stiffness: 400 },
              } : undefined}
              whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
              className="relative flex flex-col items-center gap-2 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full group"
              aria-label={`View ${story.type} story`}
            >
              {/* Story bubble container */}
              <div className="relative w-16 h-16">
                {/* Pulsing glow behind unviewed stories */}
                {!viewed && !prefersReducedMotion && (
                  <motion.div
                    className="absolute -inset-2 rounded-full blur-md"
                    style={{ background: glowColor }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                
                {/* Animated gradient ring for unviewed stories */}
                {!viewed && (
                  <motion.div
                    className={cn(
                      "absolute -inset-1 rounded-full",
                      ringClass,
                      !prefersReducedMotion && "story-ring-animate"
                    )}
                  />
                )}
                
                {/* Viewed ring (gray) */}
                {viewed && (
                  <div className="absolute -inset-1 rounded-full bg-muted-foreground/30" />
                )}
                
                {/* Inner bubble */}
                <div 
                  className={cn(
                    "absolute inset-0.5 rounded-full flex items-center justify-center",
                    "bg-background border-2 transition-transform",
                    "group-hover:scale-105",
                    viewed 
                      ? "border-muted-foreground/20" 
                      : "border-background"
                  )}
                >
                  <span className="text-2xl">{icon}</span>
                </div>
                
                {/* Unviewed indicator dot */}
                {!viewed && (
                  <motion.div
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full",
                      dotColor
                    )}
                    animate={!prefersReducedMotion ? {
                      scale: [1, 1.2, 1],
                    } : undefined}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </div>
              
              {/* Story label */}
              <span 
                className={cn(
                  "text-[10px] font-medium max-w-16 truncate text-center",
                  viewed ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {story.type === 'high_five' ? 'Great Day!' :
                 story.type === 'nudge' ? 'Alert' :
                 story.type === 'milestone' ? 'Milestone' :
                 story.type === 'goal_win' ? 'Goal!' :
                 story.type === 'spending_alert' ? 'Budget' :
                 'Streak'}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

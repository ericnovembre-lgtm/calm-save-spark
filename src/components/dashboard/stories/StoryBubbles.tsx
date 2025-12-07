import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FinancialStory } from '@/hooks/useFinancialStories';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { Sparkles, Star, TrendingUp, ChevronRight } from 'lucide-react';

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

const STORY_LABELS: Record<FinancialStory['type'], string> = {
  high_five: 'Great Day!',
  nudge: 'Alert',
  milestone: 'Milestone',
  goal_win: 'Goal!',
  spending_alert: 'Budget',
  streak: 'Streak'
};

const THEME_RING_CLASSES: Record<FinancialStory['theme'], string> = {
  emerald: 'story-ring-emerald',
  rose: 'story-ring-rose',
  amber: 'story-ring-amber',
  gold: 'story-ring-gold',
  violet: 'story-ring-gold',
  cyan: 'story-ring-amber',
};

const THEME_GLOW_COLORS: Record<FinancialStory['theme'], string> = {
  emerald: 'hsla(160, 84%, 39%, 0.4)',
  rose: 'hsla(350, 89%, 60%, 0.4)',
  amber: 'hsla(38, 92%, 50%, 0.4)',
  gold: 'hsla(45, 93%, 47%, 0.4)',
  violet: 'hsla(45, 93%, 47%, 0.4)',
  cyan: 'hsla(38, 92%, 50%, 0.4)',
};

const THEME_DOT_COLORS: Record<FinancialStory['theme'], string> = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  gold: 'bg-yellow-500',
  violet: 'bg-yellow-500',
  cyan: 'bg-amber-500',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const bubbleVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0, 
    y: 30,
    rotate: -10,
  },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 20,
    },
  },
};

// Get personalized empty state message based on time
function getEmptyStateMessage(): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  
  if (hour < 12) {
    return {
      title: "Good morning! Your story awaits",
      subtitle: "Financial insights will appear as you spend and save today"
    };
  } else if (hour < 17) {
    return {
      title: "Afternoon check-in",
      subtitle: "Keep an eye out — stories pop up as your finances evolve"
    };
  } else if (dayOfWeek === 5 || dayOfWeek === 6) {
    return {
      title: "Enjoy your weekend!",
      subtitle: "We'll highlight any notable activity soon"
    };
  } else {
    return {
      title: "Evening wrap-up coming soon",
      subtitle: "Check back for your daily financial highlights"
    };
  }
}

// Sparkle particle component
function SparkleParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -20, -40],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
      }}
    >
      <Star className="w-2 h-2 text-primary/40 fill-primary/20" />
    </motion.div>
  );
}

export function StoryBubbles({ stories, onStoryClick, isViewed }: StoryBubblesProps) {
  const prefersReducedMotion = useReducedMotion();
  const [pressedId, setPressedId] = useState<string | null>(null);
  
  // Calculate unviewed count
  const unviewedCount = useMemo(() => 
    stories.filter(s => !isViewed(s.id)).length,
    [stories, isViewed]
  );
  
  // Check if overflow (more than visible)
  const hasOverflow = stories.length > 5;

  const handleStoryClick = (index: number) => {
    haptics.select();
    onStoryClick(index);
  };

  const handlePressStart = (id: string) => {
    setPressedId(id);
    haptics.buttonPress();
  };

  const handlePressEnd = () => {
    setPressedId(null);
  };

  // Empty state with personalized message and sparkles
  if (stories.length === 0) {
    const { title, subtitle } = getEmptyStateMessage();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full py-5 px-4"
      >
        <div className="relative flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30 backdrop-blur-sm overflow-hidden">
          {/* Floating sparkle particles */}
          {!prefersReducedMotion && (
            <>
              <SparkleParticle delay={0} x={10} y={20} />
              <SparkleParticle delay={0.5} x={25} y={60} />
              <SparkleParticle delay={1} x={85} y={30} />
              <SparkleParticle delay={1.5} x={70} y={70} />
            </>
          )}
          
          {/* Animated icon */}
          <motion.div
            animate={!prefersReducedMotion ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : undefined}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0"
          >
            {/* Glow ring */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            <motion.h3 
              className="text-sm font-medium text-foreground mb-0.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h3>
            <motion.p 
              className="text-xs text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {subtitle}
            </motion.p>
          </div>
          
          {/* Trend indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Stay tuned</span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full overflow-x-auto scrollbar-hide py-4 px-4 -mx-4 snap-x snap-mandatory"
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        scrollSnapType: 'x mandatory',
      }}
      aria-label={`${unviewedCount} new stories available`}
    >
      <div className="flex gap-4 min-w-min items-end">
        {stories.map((story, index) => {
          const viewed = isViewed(story.id);
          const icon = STORY_ICONS[story.type];
          const label = STORY_LABELS[story.type];
          const ringClass = THEME_RING_CLASSES[story.theme];
          const glowColor = THEME_GLOW_COLORS[story.theme];
          const dotColor = THEME_DOT_COLORS[story.theme];
          const isPressed = pressedId === story.id;
          
          // Check if this story was created recently (within 1 hour)
          const isNew = Date.now() - new Date(story.createdAt).getTime() < 3600000;

          return (
            <motion.button
              key={story.id}
              variants={bubbleVariants}
              onClick={() => handleStoryClick(index)}
              onMouseDown={() => handlePressStart(story.id)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(story.id)}
              onTouchEnd={handlePressEnd}
              whileHover={!prefersReducedMotion ? {
                scale: 1.08,
                y: -6,
                transition: { type: 'spring', stiffness: 400, damping: 20 },
              } : undefined}
              whileTap={!prefersReducedMotion ? { scale: 0.92 } : undefined}
              animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
              className="relative flex flex-col items-center gap-2 flex-shrink-0 snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full group"
              aria-label={`View ${label} story${!viewed ? ' (unviewed)' : ''}`}
            >
              {/* Story bubble container */}
              <div className="relative w-16 h-16">
                {/* Pulsing glow behind unviewed stories */}
                {!viewed && !prefersReducedMotion && (
                  <motion.div
                    className="absolute -inset-2 rounded-full blur-lg"
                    style={{ background: glowColor }}
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 2.5,
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
                    initial={{ rotate: 0 }}
                    animate={!prefersReducedMotion ? { rotate: 360 } : undefined}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                )}
                
                {/* Viewed ring (gray) */}
                {viewed && (
                  <div className="absolute -inset-1 rounded-full bg-muted-foreground/20" />
                )}
                
                {/* Inner bubble */}
                <motion.div 
                  className={cn(
                    "absolute inset-0.5 rounded-full flex items-center justify-center",
                    "bg-background border-2 transition-all duration-200",
                    viewed 
                      ? "border-muted-foreground/20" 
                      : "border-background shadow-lg"
                  )}
                  animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={!viewed && !prefersReducedMotion ? {
                      scale: [1, 1.1, 1],
                    } : undefined}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {icon}
                  </motion.span>
                </motion.div>
                
                {/* Unviewed indicator dot with enhanced pulse */}
                {!viewed && (
                  <motion.div
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full shadow-md",
                      dotColor
                    )}
                    animate={!prefersReducedMotion ? {
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        '0 0 0 0 currentColor',
                        '0 0 0 6px transparent',
                        '0 0 0 0 currentColor'
                      ],
                    } : undefined}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* NEW badge with shimmer effect */}
                <AnimatePresence>
                  {isNew && !viewed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-primary text-primary-foreground shadow-md overflow-hidden"
                    >
                      {/* Shimmer overlay */}
                      {!prefersReducedMotion && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: [-20, 30] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        />
                      )}
                      <span className="relative">NEW</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Story label with fade effect */}
              <motion.span 
                className={cn(
                  "text-[10px] font-medium max-w-16 truncate text-center transition-colors",
                  viewed ? "text-muted-foreground" : "text-foreground"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
        
        {/* Swipe indicator for overflow */}
        {hasOverflow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center w-10 h-16 shrink-0"
          >
            <motion.div
              animate={!prefersReducedMotion ? { x: [0, 4, 0] } : undefined}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center text-muted-foreground/50"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinancialStory } from '@/hooks/useFinancialStories';
import { StoryHighFive } from './StoryHighFive';
import { StoryNudge } from './StoryNudge';
import { StoryMilestone } from './StoryMilestone';
import { StoryGoalWin } from './StoryGoalWin';
import { StorySpendingAlert } from './StorySpendingAlert';
import { StoryStreak } from './StoryStreak';
import { useNavigate } from 'react-router-dom';

interface StoryOverlayProps {
  stories: FinancialStory[];
  activeIndex: number | null;
  onClose: () => void;
  onStoryViewed: (id: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

const THEME_BG: Record<FinancialStory['theme'], string> = {
  emerald: 'from-emerald-100/90 via-emerald-50/80 to-background',
  rose: 'from-rose-100/90 via-rose-50/80 to-background',
  amber: 'from-amber-100/90 via-amber-50/80 to-background',
  gold: 'from-yellow-100/90 via-amber-50/80 to-background',
  violet: 'from-violet-100/90 via-violet-50/80 to-background',
  cyan: 'from-cyan-100/90 via-cyan-50/80 to-background'
};

export function StoryOverlay({ stories, activeIndex, onClose, onStoryViewed }: StoryOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(activeIndex ?? 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const currentStory = stories[currentIndex];

  // Handle story change
  useEffect(() => {
    if (activeIndex !== null) {
      setCurrentIndex(activeIndex);
      setProgress(0);
    }
  }, [activeIndex]);

  // Mark story as viewed when shown
  useEffect(() => {
    if (currentStory && activeIndex !== null) {
      onStoryViewed(currentStory.id);
    }
  }, [currentStory, activeIndex, onStoryViewed]);

  // Progress timer
  useEffect(() => {
    if (activeIndex === null || isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, currentIndex, stories.length, onClose]);

  // Navigation handlers
  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Touch/click handlers
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    longPressTimer.current = setTimeout(() => setIsPaused(true), 200);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsPaused(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftSide = x < rect.width / 3;
    
    if (isLeftSide) {
      goPrev();
    } else {
      goNext();
    }
  }, [goNext, goPrev]);

  // CTA handler
  const handleCTA = useCallback(() => {
    if (currentStory?.cta?.action) {
      onClose();
      navigate(currentStory.cta.action);
    }
  }, [currentStory, navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      
      switch (e.key) {
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, goNext, goPrev, onClose]);

  // Render story content based on type
  const renderStoryContent = () => {
    if (!currentStory) return null;

    switch (currentStory.type) {
      case 'high_five':
        return <StoryHighFive story={currentStory} />;
      case 'nudge':
        return <StoryNudge story={currentStory} />;
      case 'milestone':
        return <StoryMilestone story={currentStory} />;
      case 'goal_win':
        return <StoryGoalWin story={currentStory} />;
      case 'spending_alert':
        return <StorySpendingAlert story={currentStory} />;
      case 'streak':
        return <StoryStreak story={currentStory} />;
      default:
        return null;
    }
  };

  if (activeIndex === null || !currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] touch-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div 
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            THEME_BG[currentStory.theme]
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          {stories.map((story, index) => (
            <div 
              key={story.id}
              className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-white"
                initial={{ width: index < currentIndex ? '100%' : '0%' }}
                animate={{ 
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-12 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Close stories"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Story content */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-6 pt-20"
          onClick={handleClick}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          key={currentStory.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {renderStoryContent()}
        </motion.div>

        {/* Navigation hints */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
          {currentIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          
          {currentStory.cta && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); handleCTA(); }}
              className={cn(
                "px-6 py-2 rounded-full font-medium text-sm",
                "bg-white text-background hover:bg-white/90 transition-colors"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentStory.cta.label}
            </motion.button>
          )}
          
          {currentIndex < stories.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Pause indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Paused
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

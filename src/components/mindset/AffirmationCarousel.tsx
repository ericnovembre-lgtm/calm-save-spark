import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMoneyMindset } from '@/hooks/useMoneyMindset';

const defaultAffirmations = [
  "I am worthy of financial abundance",
  "Money flows to me easily and effortlessly",
  "I make wise financial decisions",
  "I am in control of my financial future",
  "Every dollar I save brings me closer to my goals",
  "I deserve to be financially free",
  "I attract opportunities for wealth",
  "My relationship with money is healthy and positive",
];

export function AffirmationCarousel() {
  const { entriesByType } = useMoneyMindset();
  const userAffirmations = entriesByType['affirmation']?.map(a => a.content) || [];
  const allAffirmations = [...userAffirmations, ...defaultAffirmations];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allAffirmations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, allAffirmations.length]);

  const goToPrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex(prev => (prev - 1 + allAffirmations.length) % allAffirmations.length);
  };

  const goToNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex(prev => (prev + 1) % allAffirmations.length);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-6 border border-primary/20">
      <div className="absolute top-4 right-4">
        <Sparkles className="w-5 h-5 text-primary/50" />
      </div>

      <div className="text-center min-h-[100px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-lg font-medium italic"
          >
            "{allAffirmations[currentIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" size="icon" onClick={goToPrev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {allAffirmations.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAutoPlay(false);
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex % 5 ? 'bg-primary' : 'bg-primary/30'
              }`}
            />
          ))}
          {allAffirmations.length > 5 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{allAffirmations.length - 5}
            </span>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={goToNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2"
        onClick={() => setIsAutoPlay(!isAutoPlay)}
      >
        <RefreshCw className={`w-3 h-3 mr-2 ${isAutoPlay ? 'animate-spin' : ''}`} />
        {isAutoPlay ? 'Auto-playing' : 'Paused'}
      </Button>
    </div>
  );
}

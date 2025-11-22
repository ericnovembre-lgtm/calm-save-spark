import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface EnhancedTypewriterProps {
  text: string;
  speed?: 'fast' | 'normal' | 'slow';
  onComplete?: () => void;
}

export function EnhancedTypewriter({ 
  text, 
  speed = 'normal',
  onComplete 
}: EnhancedTypewriterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Speed mapping with natural variation
  const speeds = {
    fast: 25,
    normal: 35,
    slow: 50
  };
  const baseSpeed = speeds[speed];

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      onComplete?.();
      return;
    }

    if (currentIndex < text.length) {
      const char = text[currentIndex];
      
      // Variable speed based on character
      let delay = baseSpeed;
      
      // Pause at punctuation for natural feel
      if (char === '.') delay = 400;
      else if (char === ',') delay = 200;
      else if (char === '!') delay = 400;
      else if (char === '?') delay = 400;
      else if (char === ' ') delay = baseSpeed * 0.8;
      
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, baseSpeed, prefersReducedMotion, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className="text-foreground">
      {displayedText}
      {currentIndex < text.length && !prefersReducedMotion && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
        />
      )}
    </div>
  );
}

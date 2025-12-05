import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type StreamingMode = 'typewriter' | 'fade-word' | 'fade-char' | 'instant';
type CursorStyle = 'block' | 'line' | 'underscore' | 'none';

interface StreamingTextProps {
  text: string;
  mode?: StreamingMode;
  speed?: number; // chars per second
  cursorStyle?: CursorStyle;
  className?: string;
  onComplete?: () => void;
  isStreaming?: boolean;
  showCursor?: boolean;
}

const cursorVariants = {
  block: 'w-2 h-[1em] bg-current',
  line: 'w-0.5 h-[1em] bg-current',
  underscore: 'w-3 h-0.5 bg-current self-end mb-0.5',
  none: 'hidden',
};

export function StreamingText({
  text,
  mode = 'typewriter',
  speed = 40,
  cursorStyle = 'line',
  className,
  onComplete,
  isStreaming = false,
  showCursor = true,
}: StreamingTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const completedRef = useRef(false);

  // Reset when text changes
  useEffect(() => {
    if (mode === 'instant' || prefersReducedMotion) {
      setDisplayedLength(text.length);
      setIsComplete(true);
      return;
    }
    
    // If new text is longer, continue from current position
    if (text.length > displayedLength) {
      setIsComplete(false);
      completedRef.current = false;
    }
  }, [text, mode, prefersReducedMotion]);

  // Typewriter effect
  useEffect(() => {
    if (mode !== 'typewriter' || prefersReducedMotion || isComplete) return;
    if (displayedLength >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const delay = 1000 / speed;
    const timeout = setTimeout(() => {
      setDisplayedLength(prev => Math.min(prev + 1, text.length));
    }, delay);

    return () => clearTimeout(timeout);
  }, [displayedLength, text, speed, mode, onComplete, prefersReducedMotion, isComplete]);

  // Split text into words for fade-word mode
  const words = useMemo(() => text.split(' '), [text]);

  if (mode === 'instant' || prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  if (mode === 'typewriter') {
    return (
      <span className={cn('inline-flex items-baseline', className)}>
        <span>{text.slice(0, displayedLength)}</span>
        {showCursor && (isStreaming || !isComplete) && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className={cn('inline-block ml-0.5', cursorVariants[cursorStyle])}
          />
        )}
      </span>
    );
  }

  if (mode === 'fade-word') {
    return (
      <span className={cn('inline-flex flex-wrap gap-1', className)}>
        {words.map((word, i) => (
          <motion.span
            key={`${i}-${word}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    );
  }

  if (mode === 'fade-char') {
    return (
      <span className={className}>
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02, duration: 0.1 }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    );
  }

  return <span className={className}>{text}</span>;
}

// Simpler component for just showing streaming indicator
export function StreamingCursor({ 
  visible = true,
  style = 'line' 
}: { 
  visible?: boolean;
  style?: CursorStyle;
}) {
  if (!visible || style === 'none') return null;
  
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      className={cn('inline-block ml-0.5', cursorVariants[style])}
    />
  );
}

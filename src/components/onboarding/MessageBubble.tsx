import { motion } from 'framer-motion';
import { EnhancedTypewriter } from './EnhancedTypewriter';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MessageBubbleProps {
  content: string;
  isLast: boolean;
  celebration?: boolean;
}

export function MessageBubble({ content, isLast, celebration }: MessageBubbleProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (celebration && !prefersReducedMotion) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [celebration, prefersReducedMotion]);

  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        "bg-primary/10 text-primary"
      )}>
        <span className="text-xl">💰</span>
      </div>
      <div className={cn(
        "flex-1 p-4 rounded-2xl rounded-tl-none",
        "bg-muted border border-border",
        celebration && "bg-primary/5 border-primary/20"
      )}>
        {isLast ? (
          <EnhancedTypewriter text={content} />
        ) : (
          <p className="text-foreground">{content}</p>
        )}
      </div>
    </div>
  );
}

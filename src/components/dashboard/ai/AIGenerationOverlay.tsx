import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, LayoutGrid, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StreamingText } from '@/components/ui/streaming-text';
import { StreamingIndicator } from '@/components/dashboard/streaming/StreamingIndicator';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { StreamPhase } from '@/hooks/useStreamingAI';

interface AIGenerationOverlayProps {
  isVisible: boolean;
  phase: StreamPhase;
  streamingText?: string;
  progress?: number;
  elapsedMs?: number;
  onCancel?: () => void;
  onSkip?: () => void;
}

const phaseDetails: Record<StreamPhase, { icon: React.ReactNode; text: string }> = {
  idle: { icon: null, text: '' },
  connecting: { icon: <Sparkles className="h-5 w-5" />, text: 'Connecting to AI...' },
  streaming: { icon: <Brain className="h-5 w-5" />, text: 'Analyzing your finances...' },
  parsing: { icon: <LayoutGrid className="h-5 w-5" />, text: 'Designing your layout...' },
  complete: { icon: <MessageSquare className="h-5 w-5" />, text: 'Ready!' },
  error: { icon: <X className="h-5 w-5" />, text: 'Something went wrong' },
};

const financialFacts = [
  "💡 Automating savings can increase your balance by 30% annually",
  "📊 People who track spending save 20% more on average",
  "🎯 Setting specific goals makes you 3x more likely to achieve them",
  "💰 The 50/30/20 rule: Needs, wants, savings",
  "🏦 Emergency funds should cover 3-6 months of expenses",
  "📈 Compound interest: The 8th wonder of the world",
];

export function AIGenerationOverlay({
  isVisible,
  phase,
  streamingText,
  progress = 0,
  elapsedMs = 0,
  onCancel,
  onSkip,
}: AIGenerationOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const [factIndex, setFactIndex] = useState(0);

  // Rotate facts
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % financialFacts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          {/* Background Pattern */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1/2 -left-1/2 w-full h-full opacity-5"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent)',
                }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
            {/* Progress Ring */}
            <div className="relative mb-8">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-white/5"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#progress-gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '352', strokeDashoffset: '352' }}
                  animate={{ strokeDashoffset: 352 - (progress / 100) * 352 }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d6c8a2" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d6c8a2" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Icon */}
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/40 to-amber-500/20 border border-white/10 flex items-center justify-center">
                  {phaseDetails[phase].icon}
                </div>
              </motion.div>
            </div>

            {/* Phase Text */}
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {phaseDetails[phase].text}
              </h2>
              {elapsedMs > 0 && (
                <p className="text-sm text-muted-foreground">
                  {Math.floor(elapsedMs / 1000)}s elapsed
                </p>
              )}
            </motion.div>

            {/* Streaming Preview */}
            {streamingText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 px-4 py-3 rounded-lg bg-white/5 border border-white/10 max-h-32 overflow-hidden"
              >
                <StreamingText
                  text={streamingText.slice(0, 200) + (streamingText.length > 200 ? '...' : '')}
                  mode="typewriter"
                  speed={60}
                  className="text-sm text-muted-foreground text-left"
                />
              </motion.div>
            )}

            {/* Financial Fact */}
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground mb-8"
              >
                {financialFacts[factIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {onSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  Skip to default
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="border-white/10"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

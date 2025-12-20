import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Brain,
  Clock
} from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StreamingText } from '@/components/ui/streaming-text';
import { LiveDot } from '@/components/dashboard/realtime/LiveDataPulse';
import { StreamingIndicator } from '@/components/dashboard/streaming/StreamingIndicator';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { DashboardBriefing, DashboardTheme } from '@/hooks/useClaudeGenerativeDashboard';

interface GenerativeBriefingProps {
  briefing: DashboardBriefing;
  theme: DashboardTheme;
  reasoning?: string;
  meta?: {
    model: string;
    processingTimeMs: number;
    generatedAt: string;
  } | null;
  streamingText?: string;
  className?: string;
}

// Brand-aligned mood gradients using semantic tokens
const moodGradients = {
  calm: 'from-secondary/40 to-background/60',
  energetic: 'from-amber-100/30 to-secondary/40',
  cautionary: 'from-orange-100/30 to-secondary/40',
  celebratory: 'from-yellow-100/30 to-secondary/40'
};

const moodIcons = {
  calm: '🧘',
  energetic: '⚡',
  cautionary: '⚠️',
  celebratory: '🎉'
};

export function GenerativeBriefing({ 
  briefing, 
  theme,
  reasoning,
  meta,
  streamingText,
  className 
}: GenerativeBriefingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const isStreaming = !!streamingText && streamingText !== briefing?.summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Holographic Glass Panel */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl",
        "backdrop-blur-3xl",
        "bg-gradient-to-br from-card/90 via-card/70 to-card/80",
        "border border-white/10",
        "shadow-[0_8px_32px_-8px_hsla(var(--primary),0.15),inset_0_1px_1px_rgba(255,255,255,0.1)]",
        "transition-all duration-500"
      )}>
        {/* Internal Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, hsla(var(--accent), 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 20% 100%, hsla(var(--primary), 0.1) 0%, transparent 40%)
            `,
          }}
          animate={isHovered && !prefersReducedMotion ? {
            opacity: [0.5, 0.8, 0.5],
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Crystal Shimmer on Hover */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsla(var(--accent), 0.12) 50%, transparent 100%)',
              transform: 'translateX(-100%)',
            }}
            animate={isHovered ? {
              transform: ['translateX(-100%)', 'translateX(100%)'],
            } : undefined}
            transition={{
              duration: 1.2,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Mood-based Ambient Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${
              theme.mood === 'calm' ? 'hsla(40, 35%, 85%, 0.3)' :
              theme.mood === 'energetic' ? 'hsla(38, 45%, 68%, 0.4)' :
              theme.mood === 'cautionary' ? 'hsla(38, 70%, 55%, 0.3)' :
              'hsla(45, 80%, 60%, 0.4)'
            } 0%, transparent 60%)`,
          }}
          animate={!prefersReducedMotion ? {
            opacity: [0.2, 0.4, 0.2],
          } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <CardContent className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Animated mood emoji with bounce */}
              <motion.span
                animate={{ 
                  scale: theme.mood === 'celebratory' ? [1, 1.2, 1] : 1,
                  rotate: theme.mood === 'energetic' ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: theme.mood === 'celebratory' || theme.mood === 'energetic' ? Infinity : 0, 
                  repeatDelay: 2 
                }}
                className="text-2xl"
              >
                {moodIcons[theme.mood]}
              </motion.span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isStreaming && (
                  <>
                    <LiveDot isLive size="sm" />
                    <span className="text-amber-500">Streaming</span>
                  </>
                )}
                {meta?.processingTimeMs && !isStreaming && (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{meta.processingTimeMs}ms</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </div>

          {/* Summary with streaming support */}
          <div className="text-foreground/90 leading-relaxed mb-4">
            {isStreaming && !streamingText ? (
              <StreamingIndicator 
                phase="streaming"
                variant="brain"
              />
            ) : isStreaming ? (
              <StreamingText
                text={streamingText}
                mode="typewriter"
                speed={50}
                isStreaming={isStreaming}
                className="text-sm"
              />
            ) : (
              <p>{briefing.summary}</p>
            )}
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Key Insight */}
                {briefing.keyInsight && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Key Insight
                    </div>
                    <p className="text-sm text-muted-foreground">{briefing.keyInsight}</p>
                  </div>
                )}

                {/* Suggested Action */}
                {briefing.suggestedAction && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Brain className="h-4 w-4 text-amber-600" />
                      Suggested Action
                    </div>
                    <p className="text-sm text-muted-foreground">{briefing.suggestedAction}</p>
                  </div>
                )}

                {/* AI Reasoning (Debug Mode) */}
                {reasoning && (
                  <div className="pt-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => setShowReasoning(!showReasoning)}
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      {showReasoning ? 'Hide' : 'Show'} AI Reasoning
                    </Button>
                    
                    <AnimatePresence>
                      {showReasoning && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 p-3 rounded bg-secondary/50 text-xs text-muted-foreground font-mono overflow-hidden"
                        >
                          {reasoning}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
        </AnimatePresence>
        </CardContent>
      </div>
    </motion.div>
  );
}

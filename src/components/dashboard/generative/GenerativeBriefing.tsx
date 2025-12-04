import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp,
  Brain,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  className?: string;
}

const moodGradients = {
  calm: 'from-slate-800/50 to-slate-900/50',
  energetic: 'from-cyan-900/30 to-slate-900/50',
  cautionary: 'from-amber-900/30 to-slate-900/50',
  celebratory: 'from-yellow-900/30 to-slate-900/50'
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
  className 
}: GenerativeBriefingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <Card className={cn(
        "overflow-hidden border-white/10 backdrop-blur-xl",
        "bg-gradient-to-r",
        moodGradients[theme.mood]
      )}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ 
                  scale: theme.mood === 'celebratory' ? [1, 1.2, 1] : 1 
                }}
                transition={{ duration: 0.5, repeat: theme.mood === 'celebratory' ? Infinity : 0, repeatDelay: 2 }}
                className="text-2xl"
              >
                {moodIcons[theme.mood]}
              </motion.span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {briefing.greeting}
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  <span>Powered by Claude Opus 4.5</span>
                  {meta?.processingTimeMs && (
                    <>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{meta.processingTimeMs}ms</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Summary */}
          <motion.p 
            className="text-foreground/90 leading-relaxed mb-4"
            initial={false}
            animate={{ height: 'auto' }}
          >
            {briefing.summary}
          </motion.p>

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
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Key Insight
                    </div>
                    <p className="text-sm text-muted-foreground">{briefing.keyInsight}</p>
                  </div>
                )}

                {/* Suggested Action */}
                {briefing.suggestedAction && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Brain className="h-4 w-4 text-violet-400" />
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
                          className="mt-3 p-3 rounded bg-slate-900/50 text-xs text-muted-foreground font-mono overflow-hidden"
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
      </Card>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SyncIndicator } from '@/components/ui/sync-indicator';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatDistanceToNow } from 'date-fns';

type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

interface DashboardHeaderProps {
  isGenerating: boolean;
  modelName?: string;
  syncStatus: SyncStatus;
  lastSynced?: Date;
  lastRefresh?: Date;
  userName?: string | null;
  onRefresh: () => void;
  onForceRefresh: () => void;
}

// Time-of-day greeting
function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  if (hour < 21) return { text: 'Good evening', emoji: '🌅' };
  return { text: 'Good night', emoji: '🌙' };
}

export function DashboardHeader({
  isGenerating,
  modelName,
  syncStatus,
  lastSynced,
  lastRefresh,
  userName,
  onRefresh,
  onForceRefresh,
}: DashboardHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Real-time greeting that updates every minute
  const [greeting, setGreeting] = useState(getGreeting());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Build full greeting with optional user name
  const fullGreeting = userName 
    ? `${greeting.text}, ${userName}`
    : greeting.text;
  
  const [displayedText, setDisplayedText] = useState(fullGreeting);
  const [showWave, setShowWave] = useState(true);
  const [showName, setShowName] = useState(true);

  // Typewriter effect for greeting on mount
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(fullGreeting);
      setShowWave(true);
      setShowName(true);
      return;
    }
    
    let index = 0;
    setDisplayedText('');
    setShowWave(false);
    setShowName(false);
    
    const timer = setInterval(() => {
      if (index < fullGreeting.length) {
        setDisplayedText(fullGreeting.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setShowWave(true);
          setShowName(true);
        }, 200);
      }
    }, 40); // Slightly faster for longer text
    
    return () => clearInterval(timer);
  }, [fullGreeting, prefersReducedMotion]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-background/85 border-b border-border/30 shadow-[0_1px_3px_0_hsla(0,0%,0%,0.04)]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <motion.div
              animate={!prefersReducedMotion ? { rotate: isGenerating ? 360 : 0 } : undefined}
              transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
              className="relative"
            >
              <div className="p-2 rounded-xl bg-primary/8 border border-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              {/* Subtle glow effect */}
              {isGenerating && !prefersReducedMotion && (
                <motion.div 
                  className="absolute inset-0 rounded-xl blur-lg bg-primary/25"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.15, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground relative flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    {displayedText}
                    {/* Typing cursor */}
                    {!prefersReducedMotion && displayedText.length < fullGreeting.length && (
                      <motion.span 
                        className="inline-block w-0.5 h-5 bg-primary"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </span>
                  {/* Animated wave emoji */}
                  <AnimatePresence>
                    {showWave && (
                      <motion.span
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0, rotate: -20 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          rotate: prefersReducedMotion ? 0 : [0, 14, -8, 14, -4, 10, 0],
                        }}
                        transition={{ 
                          opacity: { duration: 0.2 },
                          scale: { duration: 0.3, type: 'spring', stiffness: 400 },
                          rotate: { duration: 1.2, ease: 'easeInOut', delay: 0.1 }
                        }}
                        className="inline-block origin-bottom-right text-lg"
                      >
                        {greeting.emoji}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Animated gradient underline */}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: displayedText.length === fullGreeting.length ? '70%' : '0%' }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </h1>
              </div>
              <div className="flex items-center gap-2.5 mt-0.5">
                <p className="text-[11px] text-muted-foreground/70 font-medium tracking-wide flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  Powered by Claude Opus 4.5
                </p>
                {/* Model badge with glassmorphic styling */}
                {modelName && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/8 text-primary/90 border border-primary/15 backdrop-blur-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" />
                    {modelName}
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SyncIndicator status={syncStatus} lastSynced={lastSynced} onRefresh={onForceRefresh} />
            
            {/* Last refresh with relative time and fade animation */}
            {lastRefresh && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xs text-muted-foreground hidden sm:block"
              >
                {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              </motion.span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isGenerating}
              className="border-border/40 bg-background/50 hover:bg-primary/8 hover:border-primary/20 hover:text-primary transition-all duration-300 shadow-sm"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
              <span className="hidden sm:inline font-medium">Regenerate</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

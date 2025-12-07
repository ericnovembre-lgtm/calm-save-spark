import React, { useState, useEffect, useRef } from 'react';
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

// Test mode greetings for cycling through all time periods quickly
const TEST_GREETINGS = [
  { text: 'Good morning', emoji: '☀️' },
  { text: 'Good afternoon', emoji: '🌤️' },
  { text: 'Good evening', emoji: '🌅' },
  { text: 'Good night', emoji: '🌙' },
];

// Check if test mode is enabled (dev-only)
const isTestModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return process.env.NODE_ENV === 'development' && 
    localStorage.getItem('dashboard-greeting-test-mode') === 'true';
};

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
  
  // Test mode state
  const [testMode, setTestMode] = useState(isTestModeEnabled());
  const [testGreetingIndex, setTestGreetingIndex] = useState(0);
  
  // Real-time greeting that updates every minute (or 5 sec in test mode)
  const [greeting, setGreeting] = useState(getGreeting());
  const [prevGreetingText, setPrevGreetingText] = useState(greeting.text);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isInitialMount = useRef(true);
  
  // Current time state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Format time for display
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  // Active greeting based on test mode
  const activeGreeting = testMode ? TEST_GREETINGS[testGreetingIndex] : greeting;
  
  useEffect(() => {
    // Check test mode on mount and when storage changes
    const checkTestMode = () => setTestMode(isTestModeEnabled());
    window.addEventListener('storage', checkTestMode);
    return () => window.removeEventListener('storage', checkTestMode);
  }, []);
  
  useEffect(() => {
    const intervalTime = testMode ? 5000 : 60000; // 5 sec test mode, 60 sec normal
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      if (testMode) {
        setTestGreetingIndex(prev => (prev + 1) % TEST_GREETINGS.length);
      } else {
        setGreeting(getGreeting());
      }
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [testMode]);
  
  // Detect greeting time-of-day changes and trigger transition animation
  useEffect(() => {
    if (prevGreetingText !== activeGreeting.text) {
      setIsTransitioning(true);
      setPrevGreetingText(activeGreeting.text);
      
      // Reset transition state after animation completes
      const timeout = setTimeout(() => setIsTransitioning(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [activeGreeting.text, prevGreetingText]);
  
  // Build full greeting with optional user name
  const fullGreeting = userName 
    ? `${activeGreeting.text}, ${userName}`
    : activeGreeting.text;
  
  const [displayedText, setDisplayedText] = useState(fullGreeting);
  const [showWave, setShowWave] = useState(true);
  const [showName, setShowName] = useState(true);

  // Typewriter effect only on initial mount, smooth update for subsequent changes
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(fullGreeting);
      setShowWave(true);
      setShowName(true);
      return;
    }
    
    // Skip typewriter for mid-session updates (time-of-day changes)
    if (!isInitialMount.current) {
      setDisplayedText(fullGreeting);
      setShowWave(true);
      setShowName(true);
      return;
    }
    
    // Initial mount: run typewriter effect
    isInitialMount.current = false;
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
    }, 40);
    
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
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeGreeting.text}
                      className="inline-flex items-center gap-1.5"
                      initial={isTransitioning && !prefersReducedMotion ? { opacity: 0, y: 8 } : false}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                      }}
                      exit={!prefersReducedMotion ? { opacity: 0, y: -8 } : undefined}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {displayedText}
                      {/* Typing cursor - only on initial mount */}
                      {!prefersReducedMotion && displayedText.length < fullGreeting.length && (
                        <motion.span 
                          className="inline-block w-0.5 h-5 bg-primary"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      )}
                    </motion.span>
                  </AnimatePresence>
                  {/* Subtle glow effect on transition */}
                  {isTransitioning && !prefersReducedMotion && (
                    <motion.span
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.6, 0],
                        textShadow: ['0 0 0px transparent', '0 0 16px hsl(var(--primary) / 0.5)', '0 0 0px transparent']
                      }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  )}
                  {/* Animated wave emoji with bounce on transition */}
                  <AnimatePresence>
                    {showWave && (
                      <motion.span
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0, rotate: -20 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isTransitioning && !prefersReducedMotion ? [1, 1.3, 1] : 1, 
                          rotate: isTransitioning && !prefersReducedMotion 
                            ? [0, -15, 15, 0] 
                            : (prefersReducedMotion ? 0 : [0, 14, -8, 14, -4, 10, 0]),
                        }}
                        transition={{ 
                          opacity: { duration: 0.2 },
                          scale: { duration: 0.6, ease: 'easeOut' },
                          rotate: { duration: isTransitioning ? 0.6 : 1.2, ease: 'easeInOut', delay: 0.1 }
                        }}
                        className="inline-block origin-bottom-right text-lg"
                      >
                        {activeGreeting.emoji}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Test mode badge */}
                  {testMode && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/20 text-amber-600 border border-amber-500/30"
                    >
                      TEST MODE
                    </motion.span>
                  )}
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
                  <span className="text-muted-foreground/40">•</span>
                  <motion.span 
                    key={formattedTime}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="tabular-nums"
                  >
                    {formattedTime}
                  </motion.span>
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

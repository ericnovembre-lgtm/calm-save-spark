import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Loader2, BarChart3, PieChart, TrendingUp, ArrowRight, Calendar, Repeat, DollarSign, ShoppingBag, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobilePreferences } from '@/hooks/useMobilePreferences';
import { notificationSounds } from '@/lib/notification-sounds';
import { WaveformVisualizer } from '@/components/voice/WaveformVisualizer';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

interface NaturalLanguageCommanderProps {
  onQuery?: (query: string) => void;
  isProcessing?: boolean;
}

const EXAMPLE_QUERIES = [
  { text: "Coffee spending this month", icon: BarChart3 },
  { text: "Compare groceries vs dining", icon: PieChart },
  { text: "Show my biggest expenses", icon: TrendingUp },
  { text: "Weekly spending trend", icon: BarChart3 },
  { text: "Show my recurring subscriptions", icon: Repeat },
  { text: "What did I spend last weekend?", icon: Calendar },
  { text: "How much did I save this month?", icon: DollarSign },
  { text: "Top merchants I shop at", icon: ShoppingBag },
];

/**
 * Natural Language Commander
 * Floating command bar for natural language financial queries
 * "Show me spending on coffee vs. tea" → generates ad-hoc chart
 */
// Check for Speech Recognition support
const SpeechRecognition = typeof window !== 'undefined' 
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
  : null;

export function NaturalLanguageCommander({ onQuery, isProcessing }: NaturalLanguageCommanderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { preferences } = useMobilePreferences();

  // Voice settings from preferences
  const voiceEnabled = preferences?.voice_enabled ?? true;
  const autoSubmitDelay = preferences?.voice_auto_submit_delay ?? 1500;
  const feedbackSound = preferences?.voice_feedback_sound ?? true;
  const showTranscript = preferences?.voice_show_transcript ?? true;

  // Voice recognition support check
  const isVoiceSupported = !!SpeechRecognition && voiceEnabled;
  
  // Audio analyzer for waveform visualization
  const audioData = useAudioAnalyzer(isListening);

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = showTranscript;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      if (showTranscript) {
        setQuery(transcript);
      }

      // Clear any existing silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // Auto-submit after configured delay when we have final result
      if (event.results[0].isFinal) {
        if (!showTranscript) {
          setQuery(transcript);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          if (transcript.trim() && onQuery) {
            haptics.buttonPress();
            if (feedbackSound) {
              notificationSounds.message();
            }
            onQuery(transcript.trim());
            setIsListening(false);
          }
        }, autoSubmitDelay);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setVoiceError(event.error === 'not-allowed' 
        ? 'Microphone access denied' 
        : 'Voice recognition failed');
      setIsListening(false);
      haptics.validationError();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      recognition.abort();
    };
  }, [onQuery, autoSubmitDelay, feedbackSound, showTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    setVoiceError(null);
    setQuery('');
    haptics.select();
    
    if (feedbackSound) {
      notificationSounds.alert();
    }
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setVoiceError('Failed to start voice input');
    }
  }, [isListening, feedbackSound]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
    haptics.buttonPress();
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onQuery) {
      onQuery(query.trim());
    }
  };

  const handleExampleClick = (text: string) => {
    setQuery(text);
    if (onQuery) {
      onQuery(text);
    }
  };

  return (
    <>
      {/* Collapsed state - Floating pill button with pulse */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
            whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
            onClick={() => setIsExpanded(true)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-full",
              "bg-background/80 backdrop-blur-xl border border-border/50",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "text-sm text-muted-foreground hover:text-foreground",
              "hover:border-primary/30 hover:bg-background/90"
            )}
          >
            {/* Subtle pulse ring on idle */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-full border border-primary/20"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <motion.div
              animate={!prefersReducedMotion ? { scale: [1, 1.1, 1] } : undefined}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Search className="w-4 h-4" />
            </motion.div>
            <span className="hidden sm:inline">Ask anything about your finances...</span>
            <span className="sm:hidden">{isVoiceSupported && isMobile ? 'Tap to speak...' : 'Ask AI...'}</span>
            {isVoiceSupported && isMobile ? (
              <Mic className="w-3 h-3 text-primary/60" />
            ) : (
              <Sparkles className="w-3 h-3 text-primary/60" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded state - Full command bar */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            />

            {/* Command bar */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50",
                "bg-background/95 backdrop-blur-xl rounded-2xl",
                "border border-border/50 shadow-2xl overflow-hidden"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Financial Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask in plain English</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  isFocused ? "border-primary ring-2 ring-primary/20" : "border-border/50",
                  isListening && "border-rose-500 ring-2 ring-rose-500/20"
                )}>
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : isListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="relative"
                    >
                      <Mic className="w-5 h-5 text-rose-500" />
                      <motion.div
                        className="absolute inset-0 rounded-full bg-rose-500/30"
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </motion.div>
                  ) : (
                    <Search className="w-5 h-5 text-muted-foreground" />
                  )}
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={isListening ? "Listening..." : "e.g., Show me spending on coffee vs. tea this month"}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                    disabled={isProcessing || isListening}
                  />
                  
                  {/* Voice input button */}
                  {isVoiceSupported && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isListening ? "destructive" : "ghost"}
                      onClick={isListening ? stopListening : startListening}
                      disabled={isProcessing}
                      className={cn(
                        "shrink-0 relative",
                        isListening && "bg-rose-500 hover:bg-rose-600"
                      )}
                      aria-label={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!query.trim() || isProcessing || isListening}
                    className="shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Voice error message */}
                <AnimatePresence>
                  {voiceError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-destructive mt-2 text-center"
                    >
                      {voiceError}
                    </motion.p>
                  )}
                </AnimatePresence>
                
                {/* Waveform visualizer when listening */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex flex-col items-center gap-2">
                        {/* Real-time waveform */}
                        <div className="w-full max-w-[200px] mx-auto px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                          <WaveformVisualizer
                            audioData={audioData}
                            isActive={isListening}
                            state="listening"
                            variant="compact"
                            barCount={8}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Speak now... (auto-submits after silence)
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Example queries */}
              <div className="px-4 pb-4">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto scrollbar-hide">
                  {EXAMPLE_QUERIES.map((example, index) => (
                    <motion.button
                      key={example.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExampleClick(example.text)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs",
                        "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                        "transition-colors"
                      )}
                      disabled={isProcessing}
                    >
                      <example.icon className="w-3 h-3" />
                      {example.text}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer hint */}
              <div className="px-4 py-3 bg-muted/30 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground text-center">
                  Press <kbd className="px-1 py-0.5 rounded bg-muted text-[9px]">ESC</kbd> to close
                  {isVoiceSupported && ' • Tap mic for voice input'}
                  {' • '}Results powered by AI analysis
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Loader2, BarChart3, PieChart, TrendingUp, ArrowRight, Calendar, Repeat, DollarSign, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
export function NaturalLanguageCommander({ onQuery, isProcessing }: NaturalLanguageCommanderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

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
            <span className="sm:hidden">Ask AI...</span>
            <Sparkles className="w-3 h-3 text-primary/60" />
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
                  isFocused ? "border-primary ring-2 ring-primary/20" : "border-border/50"
                )}>
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-muted-foreground" />
                  )}
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="e.g., Show me spending on coffee vs. tea this month"
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                    disabled={isProcessing}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!query.trim() || isProcessing}
                    className="shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
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
                  Press <kbd className="px-1 py-0.5 rounded bg-muted text-[9px]">ESC</kbd> to close • 
                  Results powered by AI analysis
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

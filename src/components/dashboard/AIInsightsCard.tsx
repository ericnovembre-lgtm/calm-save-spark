import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ThumbsUp, ThumbsDown, X, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AIInsight {
  id: string;
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AIInsightsCard() {
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: "1",
      text: "Based on your spending patterns, you could save an extra $150/month by reducing dining out expenses by 25%.",
      action: {
        label: "Create Budget",
        onClick: () => toast.success("Opening budget planner...")
      }
    },
    {
      id: "2",
      text: "Your vacation goal is 65% complete! At your current rate, you'll reach it 2 months early. Consider increasing your emergency fund instead.",
      action: {
        label: "Adjust Goals",
        onClick: () => toast.success("Redirecting to goals...")
      }
    }
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const currentInsight = insights[currentIndex];

  // Typing effect
  useEffect(() => {
    if (!currentInsight || prefersReducedMotion) {
      setDisplayedText(currentInsight?.text || "");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    
    let currentChar = 0;
    const typingSpeed = 60; // Slowed down from 30ms to 60ms (50% speed)

    const interval = setInterval(() => {
      if (currentChar < currentInsight.text.length) {
        setDisplayedText(currentInsight.text.slice(0, currentChar + 1));
        currentChar++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [currentInsight, prefersReducedMotion]);

  const handleFeedback = (helpful: boolean) => {
    if (helpful) {
      toast.success("Thanks! We'll show you more insights like this.");
    } else {
      toast.info("Noted. We'll improve our recommendations.");
      // Move to next insight or dismiss
      if (currentIndex < insights.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsDismissed(true);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    toast.info("Insight dismissed");
  };

  if (isDismissed || !currentInsight) return null;

  return (
    <GlassCard className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Animated AI Avatar */}
            <motion.div
              className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              animate={!prefersReducedMotion && isTyping ? {
                boxShadow: [
                  "0 0 20px hsl(var(--primary)/0.3)",
                  "0 0 40px hsl(var(--primary)/0.5)",
                  "0 0 20px hsl(var(--primary)/0.3)"
                ]
              } : undefined}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
              
              {/* Thinking dots */}
              {isTyping && !prefersReducedMotion && (
                <motion.div
                  className="absolute -bottom-1 -right-1 bg-primary rounded-full px-2 py-0.5 flex gap-0.5"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-primary-foreground rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>

            <div>
              <h3 className="font-semibold text-foreground">AI Insight</h3>
              <p className="text-xs text-muted-foreground">
                Personalized for you
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Insight text with typing effect */}
        <div className="mb-4 min-h-[60px]">
          <p className="text-foreground leading-relaxed">
            {displayedText}
            {isTyping && !prefersReducedMotion && (
              <motion.span
                className="inline-block w-0.5 h-4 bg-primary ml-0.5"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </p>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {!isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Action button */}
              {currentInsight.action && (
                <Button
                  onClick={currentInsight.action.onClick}
                  className="w-full"
                  variant="default"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {currentInsight.action.label}
                </Button>
              )}

              {/* Feedback */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleFeedback(true)}
                    className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={!prefersReducedMotion ? { scale: 1.1 } : undefined}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleFeedback(false)}
                    className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={!prefersReducedMotion ? { scale: 1.1 } : undefined}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        {insights.length > 1 && (
          <div className="flex gap-1 mt-4 justify-center">
            {insights.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex 
                    ? "w-8 bg-primary" 
                    : "w-1 bg-muted"
                }`}
                layoutId={`insight-dot-${index}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </GlassCard>
  );
}

import React, { useState, useEffect, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ThumbsUp, ThumbsDown, X, TrendingUp, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useNavigate } from "react-router-dom";
import { VoiceBriefingPlayer } from "@/components/voice/VoiceBriefingPlayer";
import { useSpeakableText } from "@/hooks/useSpeakableText";
import { useInteractionFeedback } from "@/hooks/useInteractionFeedback";
import { notificationSounds } from "@/lib/notification-sounds";

// Sparkle particle component for magical effect around AI avatar
function SparkleParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.8, 0],
        scale: [0, 1.2, 0],
        y: [0, -10, -20],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        repeatDelay: 1.2,
        ease: "easeOut"
      }}
    >
      <Star className="w-2 h-2 text-primary/60 fill-primary/40" />
    </motion.div>
  );
}
interface AIInsight {
  id: string;
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Typewriter hook for "Personalized for you..." effect
function useTypewriter(text: string, speed: number = 50, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let currentChar = 0;

    const interval = setInterval(() => {
      if (currentChar < text.length) {
        setDisplayedText(text.slice(0, currentChar + 1));
        currentChar++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
}

export const AIInsightsCard = memo(function AIInsightsCard() {
  const navigate = useNavigate();
  const { generateInsightSummary } = useSpeakableText();
  const { onInsight, onTap, onSuccess } = useInteractionFeedback();
  const hasPlayedInsightSound = useRef(false);
  
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: "1",
      text: "Based on your spending patterns, you could save an extra $150/month by reducing dining out expenses by 25%.",
      action: {
        label: "Create Budget",
        onClick: () => navigate("/budget")
      }
    },
    {
      id: "2",
      text: "Your vacation goal is 65% complete! At your current rate, you'll reach it 2 months early. Consider increasing your emergency fund instead.",
      action: {
        label: "Adjust Goals",
        onClick: () => navigate("/goals")
      }
    }
  ]);
  
  // Typewriter effect for "Personalized for you..."
  const { displayedText: personalizedText, isComplete: typewriterComplete } = useTypewriter(
    'Personalized for you',
    40,
    !useReducedMotion()
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const currentInsight = insights[currentIndex];

  // Play haptic/sound when new insight appears
  useEffect(() => {
    if (currentInsight && !hasPlayedInsightSound.current) {
      // Haptic feedback for new insight
      onInsight({ sound: false });
      // Play notification sound
      notificationSounds.insight();
      hasPlayedInsightSound.current = true;
    }
  }, [currentInsight, onInsight]);

  // Reset sound flag when index changes
  useEffect(() => {
    hasPlayedInsightSound.current = false;
  }, [currentIndex]);

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
    onTap({ sound: false }); // Haptic on tap
    
    if (helpful) {
      onSuccess({ sound: true }); // Success feedback
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
    onTap({ sound: false });
    notificationSounds.dismiss();
    setIsDismissed(true);
    toast.info("Insight dismissed");
  };

  if (isDismissed || !currentInsight) return null;

  return (
    // AI Pulse Core - Pill-shaped glass container
    <motion.div
      className="relative overflow-hidden rounded-2xl backdrop-blur-3xl bg-card/80 border border-white/10 shadow-[0_8px_32px_-8px_hsla(var(--primary),0.15)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Internal ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, hsla(var(--primary), 0.1) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* AI Pulse Core Avatar with Heartbeat Animation */}
            <div className="relative">
              {/* Heartbeat pulse rings */}
              {!prefersReducedMotion && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{
                      scale: [1, 1.8, 1.8],
                      opacity: [0.6, 0, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/15"
                    animate={{
                      scale: [1, 2.2, 2.2],
                      opacity: [0.4, 0, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                      delay: 0.3,
                    }}
                  />
                </>
              )}
              
              {/* Main AI Avatar with Heartbeat */}
              <motion.div
                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsla(var(--primary),0.4)]"
                animate={!prefersReducedMotion ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    '0 0 20px hsla(var(--primary), 0.3)',
                    '0 0 30px hsla(var(--primary), 0.5)',
                    '0 0 20px hsla(var(--primary), 0.3)',
                  ],
                } : undefined}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
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
              
              {/* Floating sparkle particles */}
              {!prefersReducedMotion && (
                <>
                  <SparkleParticle delay={0} x={-30} y={-20} />
                  <SparkleParticle delay={0.5} x={100} y={-15} />
                  <SparkleParticle delay={1.0} x={95} y={80} />
                  <SparkleParticle delay={1.5} x={-25} y={85} />
                </>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-foreground">AI Insight</h3>
              {/* Typewriter effect for subtitle */}
              <p className="text-xs text-muted-foreground">
                {personalizedText}
                {!typewriterComplete && !prefersReducedMotion && (
                  <motion.span
                    className="inline-block w-0.5 h-3 bg-primary ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <VoiceBriefingPlayer
              text={generateInsightSummary(
                currentInsight.text,
                currentInsight.action?.label
              )}
              className="flex-shrink-0"
            />
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
      </div>
    </motion.div>
  );
});

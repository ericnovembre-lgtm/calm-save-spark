import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, X, Sparkles, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ContextualAIAdvisorProps {
  trigger: 'score_drop' | 'warning_zone' | 'recommendation' | 'manual';
  context: string;
  metric?: string;
  onDismiss?: () => void;
}

export const ContextualAIAdvisor = ({
  trigger,
  context,
  metric,
  onDismiss,
}: ContextualAIAdvisorProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Show after a brief delay
    const showTimer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    // Generate friendly message based on trigger
    const messages = {
      score_drop: `Hey there! 👋 I noticed your ${metric || 'financial health'} score dipped a bit. Don't worry - this happens! Let's chat about what might be causing this and how we can turn things around together.`,
      warning_zone: `Hi friend! 😊 I'm here because your ${metric || 'metric'} needs a little attention. The good news? Small changes can make a big difference, and I'm here to help you every step of the way!`,
      recommendation: `Great news! 🎉 I've been analyzing your finances and found some exciting opportunities to boost your ${metric || 'financial health'}. Want to explore them together?`,
      manual: `Hi! I'm your friendly financial wellness assistant. 💙 I'm here to help you understand ${context}. Think of me as your personal finance buddy - feel free to ask me anything!`,
    };

    const fullMessage = messages[trigger];
    
    // Typing animation
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullMessage.length) {
        setMessage(fullMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, prefersReducedMotion ? 0 : 30);

    return () => clearInterval(typingInterval);
  }, [trigger, metric, context, prefersReducedMotion]);

  const handleOpenChat = () => {
    // Navigate to AI chat with pre-filled context
    navigate('/dashboard', { state: { openChat: true, context } });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="fixed bottom-24 right-6 z-50 max-w-md"
        >
          <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background backdrop-blur-xl shadow-2xl">
            {/* Animated background effect */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
                    animate={prefersReducedMotion ? {} : {
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Bot className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      Your Financial Coach
                      <Sparkles className="w-4 h-4 text-primary" />
                    </h4>
                    <p className="text-xs text-muted-foreground">Powered by AI</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10"
                  onClick={handleDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message */}
              <div className="mb-4 p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-sm text-foreground leading-relaxed">
                  {message}
                  {isTyping && (
                    <motion.span
                      className="inline-block w-1 h-4 ml-1 bg-primary"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </p>
              </div>

              {/* Actions */}
              {!isTyping && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    className="flex-1 group"
                    onClick={handleOpenChat}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Let's Chat
                    <motion.span
                      className="ml-1"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                  >
                    Maybe Later
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

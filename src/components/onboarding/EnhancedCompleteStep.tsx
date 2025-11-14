import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { CheckCircle, Sparkles, TrendingUp, Target, Shield, Share2, Trophy, Zap } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useCelebrationSounds } from "@/hooks/useCelebrationSounds";
import { useShareAchievement } from "@/hooks/useShareAchievement";
import NeutralConfetti from "@/components/effects/NeutralConfetti";

interface EnhancedCompleteStepProps {
  onComplete: () => void;
  userName?: string;
  completionTime?: number; // in seconds
  formData?: Record<string, any>;
  onPrevious?: () => void;
}

const EnhancedCompleteStep = ({ onComplete, userName, completionTime, formData, onPrevious }: EnhancedCompleteStepProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();
  const { shareAchievement } = useShareAchievement();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showFireworks, setShowFireworks] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showBadge, setShowBadge] = useState(false);

  const achievements = [
    { icon: Target, label: "First Goal Created", color: "text-primary", delay: 0 },
    { icon: Zap, label: "Automation Enabled", color: "text-primary", delay: 0.2 },
    { icon: Shield, label: "Secure Setup Complete", color: "text-primary", delay: 0.4 }
  ];

  useEffect(() => {
    // Trigger success haptic and sounds on mount
    triggerHaptic("success");
    playConfettiPop();
    
    setTimeout(() => {
      playSuccessChime();
      setShowFireworks(true);
    }, 200);

    // Show badge after a delay
    setTimeout(() => {
      setShowBadge(true);
      triggerHaptic("medium");
    }, 1000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-redirect
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [onComplete, playSuccessChime, playConfettiPop, triggerHaptic]);

  const handleComplete = () => {
    triggerHaptic("medium");
    onComplete();
  };

  const handleShare = () => {
    triggerHaptic("light");
    shareAchievement();
  };

  const timeMinutes = completionTime ? Math.floor(completionTime / 60) : 3;
  const timeSeconds = completionTime ? completionTime % 60 : 0;

  return (
    <>
      <NeutralConfetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Fireworks effect */}
      {showFireworks && !prefersReducedMotion && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${(i * 30) % 360}, 70%, 60%)`,
                left: "50%",
                top: "30%",
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                x: Math.cos((i * Math.PI * 2) / 12) * 300,
                y: Math.sin((i * Math.PI * 2) / 12) * 300,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: 2,
                repeatDelay: 0.5,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border shadow-[var(--shadow-card)] overflow-hidden relative">
          {/* Animated background gradient */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 opacity-5 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 50%, hsl(var(--primary)) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}

          <CardContent className="p-8 md:p-12 text-center relative">
            {/* Animated icon with pulse effect */}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="mb-6 relative inline-block"
            >
              <motion.div
                animate={prefersReducedMotion ? {} : {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-24 h-24 text-primary mx-auto" />
              </motion.div>

              {/* Pulsing glow */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 hsl(var(--primary) / 0.4)",
                      "0 0 0 20px hsl(var(--primary) / 0)",
                      "0 0 0 0 hsl(var(--primary) / 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Personalized message */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                {userName ? `You're all set, ${userName}!` : "You're all set!"}
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                Welcome to your financial transformation journey. Your future self will thank you! 🌟
              </p>
            </motion.div>

            {/* Stats card */}
            {completionTime && (
              <motion.div
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Completion time</p>
                <p className="text-2xl font-bold text-foreground">
                  {timeMinutes}m {timeSeconds}s
                </p>
                <p className="text-xs text-primary mt-1">
                  ⚡ 20% faster than average!
                </p>
              </motion.div>
            )}

            {/* Achievement badges */}
            <div className="mb-8 flex justify-center gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.label}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.6 + achievement.delay,
                      type: "spring",
                      duration: 0.6
                    }}
                    className="relative"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <Icon className={`w-8 h-8 ${achievement.color}`} />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + achievement.delay }}
                    >
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Unlocked badge */}
            <AnimatePresence>
              {showBadge && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mb-6 p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40"
                >
                  <div className="flex items-center gap-4 justify-center mb-3">
                    <motion.div
                      animate={prefersReducedMotion ? {} : { rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                    >
                      <Trophy className="w-8 h-8 text-primary" />
                    </motion.div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">Achievement Unlocked!</p>
                      <p className="font-bold text-lg text-foreground">Onboarding Master</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    +50 XP • First goal created • Automation enabled
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkle decoration */}
            {!prefersReducedMotion && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 40}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                ))}
              </>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handleComplete}
                className="gap-2 shadow-lg"
              >
                Go to Dashboard
                <TrendingUp className="w-5 h-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Achievement
              </Button>
            </div>

            {/* Countdown */}
            <motion.p
              className="text-sm text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Redirecting in {countdown} seconds...
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default EnhancedCompleteStep;

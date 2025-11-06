import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { CheckCircle, Sparkles, TrendingUp, Target, Shield } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import NeutralConfetti from "@/components/effects/NeutralConfetti";

interface CompleteStepProps {
  onComplete: () => void;
}

const CompleteStep = ({ onComplete }: CompleteStepProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [showConfetti, setShowConfetti] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
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

    // Auto-redirect after showing celebration
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [onComplete]);

  const achievements = [
    { icon: Target, label: "Goals Set", color: "text-primary" },
    { icon: TrendingUp, label: "Automation Enabled", color: "text-primary" },
    { icon: Shield, label: "Secure Account", color: "text-primary" }
  ];

  return (
    <>
      <NeutralConfetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
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
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                {/* Pulsing glow ring */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20 -m-4"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                
                <SaveplusAnimIcon 
                  name="piggy-bank" 
                  size={120}
                  className="text-primary relative z-10"
                />
                
                {/* Animated check badge */}
                <motion.div
                  initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="absolute -top-2 -right-2 z-20"
                >
                  <CheckCircle 
                    className="w-12 h-12 text-primary bg-background rounded-full"
                    strokeWidth={2.5}
                  />
                </motion.div>

                {/* Sparkle decorations */}
                {!prefersReducedMotion && [
                  { top: "0%", left: "10%", delay: 0.6 },
                  { top: "20%", right: "5%", delay: 0.8 },
                  { bottom: "10%", left: "5%", delay: 1.0 }
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={pos}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      delay: pos.delay,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-primary" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Title with stagger animation */}
            <motion.h1 
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
            >
              You're all set! 🎉
            </motion.h1>
            
            <motion.p 
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
            >
              Your $ave+ account is ready. Let's start building your financial future together.
            </motion.p>

            {/* Achievement badges */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.6 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="flex flex-col items-center p-4 rounded-lg bg-accent/50 border border-border"
                >
                  <achievement.icon className={`w-6 h-6 mb-2 ${achievement.color}`} />
                  <span className="text-xs font-medium text-muted-foreground text-center">
                    {achievement.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* CTA with countdown */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="space-y-4"
            >
              <Button 
                size="lg" 
                onClick={onComplete}
                className="gap-2 hover-scale"
                aria-label="Go to dashboard"
              >
                Go to Dashboard
              </Button>
              
              <motion.p 
                key={countdown}
                initial={prefersReducedMotion ? false : { scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-sm text-muted-foreground"
              >
                Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default CompleteStep;

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Share2, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NeutralConfetti } from "@/components/effects/NeutralConfetti";
import { useCelebrationSounds } from "@/hooks/useCelebrationSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useShareAchievement } from "@/hooks/useShareAchievement";
import { useEffect, useState } from "react";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

interface GoalCompletionCelebrationProps {
  goal: Goal | null;
  onDismiss: () => void;
  onNextGoal?: () => void;
}

export function GoalCompletionCelebration({ 
  goal, 
  onDismiss, 
  onNextGoal 
}: GoalCompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();
  const { triggerHaptic } = useHapticFeedback();
  const { shareAchievement } = useShareAchievement();

  useEffect(() => {
    if (goal) {
      setShowConfetti(true);
      playSuccessChime();
      setTimeout(() => playConfettiPop(), 300);
      
      // Victory haptic pattern
      triggerHaptic('heavy');
      setTimeout(() => triggerHaptic('medium'), 200);
      setTimeout(() => triggerHaptic('light'), 400);
    }
  }, [goal, playSuccessChime, playConfettiPop, triggerHaptic]);

  const handleShare = async () => {
    if (goal) {
      const shareData = {
        title: `🎯 Goal Completed!`,
        text: `I just reached my savings goal "${goal.name}" of $${goal.target_amount.toLocaleString()} on $ave+!`,
        url: window.location.origin
      };
      
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log('Share cancelled');
        }
      } else {
        navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      }
    }
  };

  return (
    <>
      <NeutralConfetti show={showConfetti} duration={3000} count={80} />
      
      <AnimatePresence>
        {goal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md px-4"
            onClick={onDismiss}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{ type: "spring", duration: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 backdrop-blur-xl border-2 border-primary/30 shadow-2xl">
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, hsl(var(--primary) / 0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, hsl(var(--primary) / 0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, hsl(var(--primary) / 0.2) 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                <div className="relative p-8">
                  {/* Success Icon */}
                  <motion.div
                    className="mx-auto w-24 h-24 mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
                  >
                    <div className="relative w-full h-full">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60"
                        animate={{
                          boxShadow: [
                            '0 0 20px hsl(var(--primary) / 0.5)',
                            '0 0 40px hsl(var(--primary) / 0.8)',
                            '0 0 20px hsl(var(--primary) / 0.5)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Text Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                      Goal Completed! 🎉
                    </h2>
                    <p className="text-lg font-semibold text-primary mb-2">
                      {goal.name}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${goal.target_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You've successfully reached your savings goal!
                    </p>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Achievement
                    </Button>
                    
                    {onNextGoal && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={onNextGoal}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Set Next Goal
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={onDismiss}
                    >
                      Continue
                    </Button>
                  </motion.div>
                </div>

                {/* Floating Particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/40"
                    initial={{ 
                      x: Math.random() * 100 - 50,
                      y: 100,
                      opacity: 0
                    }}
                    animate={{
                      y: [100, -100],
                      x: [
                        Math.random() * 100 - 50,
                        Math.random() * 100 - 50,
                      ],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    style={{
                      left: `${(i / 6) * 100}%`
                    }}
                  />
                ))}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

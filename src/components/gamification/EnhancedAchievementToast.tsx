import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NeutralConfetti } from "@/components/effects/NeutralConfetti";
import { useCelebrationSounds } from "@/hooks/useCelebrationSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useShareAchievement } from "@/hooks/useShareAchievement";
import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  badge_color?: string;
  points: number;
}

interface EnhancedAchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function EnhancedAchievementToast({ achievement, onDismiss }: EnhancedAchievementToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();
  const { triggerHaptic } = useHapticFeedback();
  const { shareAchievement } = useShareAchievement();

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      playSuccessChime();
      setTimeout(() => playConfettiPop(), 200);
      triggerHaptic('success');

      const timer = setTimeout(() => {
        setShowConfetti(false);
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, playSuccessChime, playConfettiPop, triggerHaptic, onDismiss]);

  const handleShare = async () => {
    if (achievement) {
      const shareData = {
        title: `🎉 Achievement Unlocked!`,
        text: `I just earned "${achievement.name}" on $ave+! ${achievement.description}`,
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
      <NeutralConfetti show={showConfetti} duration={3000} count={50} />
      
      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-2 border-primary/30 shadow-2xl">
              {/* Gleam effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />

              <div className="relative p-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={onDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-start gap-4">
                  {/* 3D Badge Icon */}
                  <motion.div
                    animate={{
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotateY: { duration: 2, ease: "easeInOut" },
                      scale: { duration: 1, repeat: Infinity, repeatDelay: 2 }
                    }}
                    className="relative"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-lg">
                      <Trophy className="w-8 h-8 text-primary-foreground" />
                      
                      {/* Gleam */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </div>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-display font-bold text-lg text-foreground mb-1"
                    >
                      🎉 Achievement Unlocked!
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-semibold text-primary mb-1"
                    >
                      {achievement.name}
                    </motion.p>
                    
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-muted-foreground mb-3"
                    >
                      {achievement.description}
                    </motion.p>

                    {achievement.points && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                      >
                        +{achievement.points} XP
                      </motion.div>
                    )}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 flex gap-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onDismiss}
                    className="flex-1"
                  >
                    Awesome!
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

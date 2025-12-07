import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeutralConfetti from "@/components/effects/NeutralConfetti";

interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  badge_color?: string;
  points: number;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementNotification({ achievements, onDismiss }: AchievementNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (achievements.length > 0) {
      setShowConfetti(true);
      
      // Auto-advance through achievements
      if (currentIndex < achievements.length - 1) {
        const timer = setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setShowConfetti(true);
        }, 4000);
        return () => clearTimeout(timer);
      } else {
        // Auto-dismiss after showing last achievement
        const timer = setTimeout(() => {
          onDismiss();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, achievements.length, onDismiss]);

  if (achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];

  const colorMap: Record<string, string> = {
    gold: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    silver: "bg-gray-400/20 text-gray-600 border-gray-400/30",
    bronze: "bg-amber-600/20 text-amber-600 border-amber-600/30",
    amber: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    green: "bg-green-500/20 text-green-600 border-green-500/30",
    purple: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  };

  return (
    <>
      <NeutralConfetti 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        duration={3000}
        count={40}
      />

      <div className="fixed top-4 right-4 z-[9998] max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAchievement.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              duration: 0.4 
            }}
          >
            <Card className="p-6 shadow-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <motion.div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    colorMap[currentAchievement.badge_color || 'gold'] || colorMap.gold
                  } border-2`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    delay: 0.1
                  }}
                >
                  <Trophy className="w-8 h-8" />
                </motion.div>

                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">
                        Achievement Unlocked!
                      </h3>
                    </div>
                    
                    <p className="font-semibold text-foreground mb-1">
                      {currentAchievement.name}
                    </p>
                    
                    {currentAchievement.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {currentAchievement.description}
                      </p>
                    )}

                    <Badge variant="secondary" className="text-xs">
                      +{currentAchievement.points} points
                    </Badge>
                  </motion.div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {achievements.length > 1 && (
                <motion.div
                  className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {achievements.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentIndex 
                          ? 'w-8 bg-primary' 
                          : 'w-1.5 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
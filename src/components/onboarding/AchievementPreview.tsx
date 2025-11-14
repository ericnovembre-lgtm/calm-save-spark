import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Trophy, Lock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

const PREVIEW_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_goal",
    name: "Goal Setter",
    icon: "🎯",
    description: "Create your first savings goal",
    requirement: "Complete onboarding",
  },
  {
    id: "first_save",
    name: "First Save",
    icon: "💰",
    description: "Make your first savings contribution",
    requirement: "Save any amount",
  },
  {
    id: "week_streak",
    name: "Consistency King",
    icon: "🔥",
    description: "Save for 7 days in a row",
    requirement: "7 day streak",
  },
  {
    id: "automation",
    name: "Set & Forget",
    icon: "⚡",
    description: "Enable automatic savings",
    requirement: "Turn on automation",
  },
];

export const AchievementPreview = () => {
  const prefersReducedMotion = useReducedMotion();
  const [visibleAchievements, setVisibleAchievements] = useState<Achievement[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Stagger the appearance of achievements
    PREVIEW_ACHIEVEMENTS.forEach((achievement, index) => {
      setTimeout(() => {
        setVisibleAchievements(prev => [...prev, achievement]);
      }, index * 300);
    });
  }, []);

  return (
    <div className="my-8">
      <motion.div
        className="text-center mb-6"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Achievements Await</h3>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Unlock these badges as you build your savings habit
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AnimatePresence>
          {visibleAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={prefersReducedMotion ? false : {
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
                rotate: index % 2 === 0 ? -15 : 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              onHoverStart={() => setHoveredId(achievement.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="relative"
            >
              {/* Achievement Badge */}
              <motion.div
                className="relative bg-gradient-to-br from-card to-secondary rounded-xl p-4 border-2 border-border cursor-pointer overflow-hidden"
                whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -5 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                {/* Lock overlay */}
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>

                {/* Badge icon */}
                <motion.div
                  className="text-4xl mb-2 relative z-10 opacity-50 filter grayscale"
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          scale: hoveredId === achievement.id ? [1, 1.2, 1] : 1,
                          rotate: hoveredId === achievement.id ? [0, -10, 10, 0] : 0,
                        }
                  }
                  transition={{ duration: 0.5 }}
                >
                  {achievement.icon}
                </motion.div>

                {/* Badge name */}
                <h4 className="text-xs font-semibold text-foreground mb-1 line-clamp-1">
                  {achievement.name}
                </h4>

                {/* Progress indicator */}
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "0%" }}
                  />
                </div>

                {/* Shimmer effect on hover */}
                {hoveredId === achievement.id && !prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {hoveredId === achievement.id && (
                  <motion.div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 z-20 pointer-events-none"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-xs text-popover-foreground mb-1">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-primary font-medium">Unlock:</span>{" "}
                        {achievement.requirement}
                      </p>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating sparkles */}
              {hoveredId === achievement.id && !prefersReducedMotion && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-primary rounded-full"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: "10%",
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Coming Soon Badge */}
      <motion.div
        className="mt-4 text-center"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>+12 more achievements to unlock</span>
        </span>
      </motion.div>
    </div>
  );
};

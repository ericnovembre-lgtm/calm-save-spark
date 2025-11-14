import { motion } from "framer-motion";
import { Star, Crown, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { NeutralConfetti } from "@/components/effects/NeutralConfetti";
import { useState, useEffect } from "react";

export function LevelSystem() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousXP, setPreviousXP] = useState(0);

  const { data: stats } = useQuery({
    queryKey: ["user-level-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get total points from achievements
      const { data: achievements } = await supabase
        .from("user_achievements")
        .select("achievements(points)")
        .eq("user_id", user.id);

      const totalXP = achievements?.reduce((sum, a) => sum + (a.achievements?.points || 0), 0) || 0;
      
      // Calculate level (100 XP per level)
      const level = Math.floor(totalXP / 100) + 1;
      const currentLevelXP = totalXP % 100;
      const xpForNextLevel = 100;
      const progress = (currentLevelXP / xpForNextLevel) * 100;

      return { level, totalXP, currentLevelXP, xpForNextLevel, progress };
    }
  });

  useEffect(() => {
    if (stats && previousXP > 0 && stats.totalXP > previousXP) {
      const previousLevel = Math.floor(previousXP / 100) + 1;
      if (stats.level > previousLevel) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
    }
    if (stats) {
      setPreviousXP(stats.totalXP);
    }
  }, [stats, previousXP]);

  if (!stats) return null;

  const getLevelIcon = (level: number) => {
    if (level >= 20) return Crown;
    if (level >= 10) return Star;
    return Zap;
  };

  const Icon = getLevelIcon(stats.level);

  return (
    <>
      <NeutralConfetti show={showLevelUp} duration={3000} count={60} />
      
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 mb-4">
              <Icon className="w-16 h-16 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-2">
              Level {stats.level}
            </h2>
            <p className="text-xl text-muted-foreground">
              Congratulations! 🎉
            </p>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
      >
        <div className="relative">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Icon className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={stats.level}
          >
            {stats.level}
          </motion.div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-foreground">Level {stats.level}</span>
            <span className="text-xs text-muted-foreground">
              {stats.currentLevelXP}/{stats.xpForNextLevel} XP
            </span>
          </div>
          <Progress value={stats.progress} className="h-2" />
        </div>
      </motion.div>
    </>
  );
}

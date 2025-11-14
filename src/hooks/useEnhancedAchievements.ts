import { useState, useEffect } from "react";
import { useAchievementNotifications } from "./useAchievementNotifications";

interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  badge_color?: string;
  points: number;
}

export function useEnhancedAchievements() {
  const { newAchievements, dismissAchievements } = useAchievementNotifications();
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (newAchievements.length > 0 && !currentAchievement) {
      setCurrentAchievement(newAchievements[0]);
    }
  }, [newAchievements, currentAchievement]);

  const handleDismiss = () => {
    setCurrentAchievement(null);
    dismissAchievements();
  };

  return {
    currentAchievement,
    handleDismiss
  };
}

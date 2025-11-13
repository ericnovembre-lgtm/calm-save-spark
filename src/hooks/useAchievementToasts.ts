import { useEffect } from "react";
import { toast } from "sonner";
import { Trophy, Target, Zap, Star } from "lucide-react";
import { createElement } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  points?: number;
  freeze_day_reward?: number;
}

export const useAchievementToasts = (achievements: Achievement[]) => {
  useEffect(() => {
    if (!achievements || achievements.length === 0) return;

    achievements.forEach((achievement, index) => {
      // Delay each toast slightly for multiple achievements
      setTimeout(() => {
        showAchievementToast(achievement);
      }, index * 500);
    });
  }, [achievements]);
};

export const showAchievementToast = (achievement: Achievement & { freeze_day_reward?: number }) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'target': return Target;
      case 'zap': return Zap;
      case 'star': return Star;
      default: return Trophy;
    }
  };

  const Icon = getIcon(achievement.icon);

  let description = achievement.description;
  if (achievement.freeze_day_reward && achievement.freeze_day_reward > 0) {
    description = `${achievement.description}\n🎁 Reward: ${achievement.freeze_day_reward} freeze day${achievement.freeze_day_reward > 1 ? 's' : ''}!`;
  }

  toast.success(`🎉 Achievement Unlocked! - ${achievement.name}`, {
    description,
    duration: 5000,
    position: "top-center",
    icon: createElement(Icon, { className: "w-5 h-5 text-yellow-500" }),
  });
};

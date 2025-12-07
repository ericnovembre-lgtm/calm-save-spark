import { motion } from "framer-motion";
import { Award, Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AchievementShareCard } from "./AchievementShareCard";
import { AchievementProgress } from "./AchievementProgress";

interface AchievementBadgeProps {
  name: string;
  description?: string;
  icon?: string;
  badgeColor?: string;
  points: number;
  earnedAt?: string;
  locked?: boolean;
  achievementId?: string;
  achievementType?: string;
  requirement?: any;
}

export function AchievementBadge({
  name,
  description,
  icon = "award",
  badgeColor = "gold",
  points,
  earnedAt,
  locked = false,
  achievementId,
  achievementType,
  requirement,
}: AchievementBadgeProps) {
  const IconComponent = icon === "trophy" ? Trophy : icon === "star" ? Star : Award;

  const colorMap: Record<string, string> = {
    gold: "text-yellow-500 bg-yellow-500/10",
    silver: "text-gray-400 bg-gray-400/10",
    bronze: "text-amber-600 bg-amber-600/10",
    amber: "text-amber-500 bg-amber-500/10",
    green: "text-green-500 bg-green-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: locked ? 1 : 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "p-4 text-center transition-all",
          locked && "opacity-50 grayscale"
        )}
      >
        <div className={cn(
          "w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center",
          colorMap[badgeColor] || colorMap.gold
        )}>
          <IconComponent className="w-8 h-8" />
        </div>
        
        <h3 className="font-semibold text-foreground mb-1">{name}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
        
        <Badge variant="secondary" className="text-xs">
          {points} pts
        </Badge>
        
        {earnedAt && !locked && (
          <>
            <p className="text-xs text-muted-foreground mt-2">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
            <div className="mt-3">
              <AchievementShareCard
                achievementName={name}
                achievementDescription={description || ""}
                points={points}
                earnedAt={earnedAt}
              />
            </div>
          </>
        )}
        
        {locked && (
          <>
            <p className="text-xs text-muted-foreground mt-2">
              🔒 Locked
            </p>
            {achievementId && achievementType && requirement && (
              <AchievementProgress
                achievementId={achievementId}
                achievementName={name}
                achievementType={achievementType}
                requirement={requirement}
              />
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
}
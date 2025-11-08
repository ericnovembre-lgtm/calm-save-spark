import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  streakType?: string;
}

export function StreakDisplay({ currentStreak, longestStreak, streakType = "daily_save" }: StreakDisplayProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ 
            scale: currentStreak > 0 ? [1, 1.1, 1] : 1,
          }}
          transition={{ 
            duration: 1,
            repeat: currentStreak > 0 ? Infinity : 0,
            repeatDelay: 2,
          }}
        >
          <Flame className={`w-12 h-12 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Longest: <strong className="text-foreground">{longestStreak}</strong> days
            </span>
            {currentStreak > 0 && (
              <span className="text-green-600">
                Keep it going! 🔥
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
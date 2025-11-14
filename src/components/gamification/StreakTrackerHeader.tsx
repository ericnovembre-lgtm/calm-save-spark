import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function StreakTrackerHeader() {
  const { data: profile } = useQuery({
    queryKey: ["profile-streak-header"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("current_streak")
        .eq("id", user.id)
        .single();

      return data;
    }
  });

  const streak = profile?.current_streak || 0;
  
  // Calculate fire intensity based on streak
  const getFireIntensity = (streak: number) => {
    if (streak === 0) return { color: "text-muted-foreground", size: "w-5 h-5", glow: false };
    if (streak < 7) return { color: "text-orange-400", size: "w-5 h-5", glow: false };
    if (streak < 30) return { color: "text-orange-500", size: "w-6 h-6", glow: true };
    return { color: "text-orange-600", size: "w-7 h-7", glow: true };
  };

  const intensity = getFireIntensity(streak);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="relative"
        animate={streak > 0 ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: streak > 0 ? Infinity : 0,
          repeatDelay: 1
        }}
      >
        <Flame className={`${intensity.size} ${intensity.color}`} />
        
        {intensity.glow && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 10px hsl(var(--primary) / 0.3)",
                "0 0 20px hsl(var(--primary) / 0.5)",
                "0 0 10px hsl(var(--primary) / 0.3)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        )}
      </motion.div>

      <div className="flex flex-col items-start">
        <span className="text-xs text-muted-foreground font-medium">Streak</span>
        <motion.span
          key={streak}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-bold text-foreground"
        >
          {streak} {streak === 1 ? 'day' : 'days'}
        </motion.span>
      </div>
    </motion.div>
  );
}

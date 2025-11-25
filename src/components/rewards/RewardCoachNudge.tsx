import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function RewardCoachNudge() {
  const prefersReducedMotion = useReducedMotion();

  const { data: nudge, isLoading } = useQuery({
    queryKey: ['reward-coach-nudge'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('reward-coach-nudge');
      if (error) {
        console.error('Error fetching coach nudge:', error);
        return null;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading || !nudge) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 p-6">
        {/* Animated background glow */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">AI Spend Coach</h3>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            
            <p className="text-foreground/90 leading-relaxed">
              {nudge.message}
            </p>

            {nudge.progress && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress to next reward</span>
                  <span className="font-medium text-foreground">{nudge.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={prefersReducedMotion ? { width: `${nudge.progress}%` } : { width: 0 }}
                    animate={{ width: `${nudge.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

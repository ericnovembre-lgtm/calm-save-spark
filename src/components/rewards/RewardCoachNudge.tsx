import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function RewardCoachNudge() {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();

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

  const refreshTip = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('reward-coach-nudge', {
        body: { refresh: true }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['reward-coach-nudge'], data);
    },
  });

  if (isLoading || !nudge) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/80 to-accent/10 border-primary/20 p-6">
        {/* Glassmorphic noise texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }} 
        />

        {/* Animated shimmer on "Next Reward" */}
        {!prefersReducedMotion && nudge.nextReward && (
          <motion.div
            className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/20 to-transparent blur-xl"
            animate={{
              x: [-100, 100],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 relative">
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/30 blur-md"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">AI Spend Coach</h3>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshTip.mutate()}
                disabled={refreshTip.isPending}
                className="gap-2 text-xs"
              >
                {refreshTip.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Ask for Tip
              </Button>
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
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden relative backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
                    initial={prefersReducedMotion ? { width: `${nudge.progress}%` } : { width: 0 }}
                    animate={{ 
                      width: `${nudge.progress}%`,
                      backgroundPosition: ['0% 0%', '100% 0%']
                    }}
                    transition={{ 
                      width: { duration: 0.8, ease: "easeOut" },
                      backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                    }}
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

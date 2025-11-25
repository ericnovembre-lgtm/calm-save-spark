import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Shield, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StreakProtectorCard() {
  const prefersReducedMotion = useReducedMotion();

  const { data: freezeInventory } = useQuery({
    queryKey: ['streak-freeze-inventory'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('streak_freeze_inventory')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { freeze_days_available: 0, freeze_days_used: 0 };
    },
  });

  const { data: streak } = useQuery({
    queryKey: ['user-streak'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('streak_type', 'daily_save')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { current_streak: 0, longest_streak: 0 };
    },
  });

  const availableFreezes = (freezeInventory?.freeze_days_available || 0) - (freezeInventory?.freeze_days_used || 0);
  const hasProtection = availableFreezes > 0;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <motion.div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              hasProtection 
                ? 'bg-primary/20' 
                : 'bg-muted'
            }`}
            animate={!prefersReducedMotion && hasProtection ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Shield 
              className={`w-8 h-8 ${
                hasProtection 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            />
          </motion.div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Streak Protector</h3>
            <p className="text-sm text-muted-foreground">
              {hasProtection 
                ? 'Your streak is protected. One missed action won\'t break your progress.' 
                : 'Earn freeze days to protect your streak from interruptions.'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                hasProtection ? 'bg-green-500' : 'bg-muted-foreground'
              }`} />
              <span className="text-muted-foreground">Protection Status</span>
              <span className="font-medium text-foreground">
                {hasProtection ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {availableFreezes} freeze {availableFreezes === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {hasProtection && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-foreground font-medium">Protection Benefits Active</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Streak-based multiplier protected</li>
                  <li>• Quarterly bonus eligibility maintained</li>
                  <li>• Golden Streak status preserved</li>
                </ul>
              </div>
            </div>
          )}

          {!hasProtection && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                Complete achievements and challenges to earn freeze days and protect your progress.
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

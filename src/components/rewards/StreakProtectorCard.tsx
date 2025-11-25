import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { toast } from "sonner";
import { useState } from "react";

export function StreakProtectorCard() {
  const prefersReducedMotion = useReducedMotion();
  const [isToggled, setIsToggled] = useState(true);

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
  const isActive = hasProtection && isToggled;

  return (
    <Card className={`p-6 transition-all ${
      isActive 
        ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' 
        : 'bg-muted/30'
    }`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 relative">
          {/* Emerald glow ring when active */}
          {!prefersReducedMotion && isActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-500/40"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          <motion.div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
              isActive 
                ? 'bg-emerald-500/20 border-2 border-emerald-500/30' 
                : 'bg-slate-700/50 border-2 border-slate-600/30'
            }`}
            animate={!prefersReducedMotion && isActive ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Shield 
              className={`w-8 h-8 transition-all ${
                isActive 
                  ? 'text-emerald-500 fill-emerald-500/20' 
                  : 'text-slate-400'
              }`}
            />
          </motion.div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Streak Protector</h3>
              <p className="text-sm text-muted-foreground">
                {hasProtection 
                  ? 'Your streak is protected. One missed action won\'t break your progress.' 
                  : 'Earn freeze days to protect your streak from interruptions.'}
              </p>
            </div>
            {hasProtection && (
              <Switch
                checked={isToggled}
                onCheckedChange={(checked) => {
                  setIsToggled(checked);
                  toast.success(checked ? 'Streak protection activated' : 'Streak protection deactivated');
                }}
                className="data-[state=checked]:bg-emerald-500"
              />
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <motion.div 
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                animate={!prefersReducedMotion && isActive ? {
                  boxShadow: [
                    '0 0 0 0 rgba(34, 197, 94, 0.7)',
                    '0 0 0 6px rgba(34, 197, 94, 0)',
                  ]
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <span className="text-muted-foreground">Status</span>
              <span className={`font-medium ${isActive ? 'text-emerald-500' : 'text-foreground'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {availableFreezes} freeze {availableFreezes === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {isActive && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
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
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatDistanceToNow } from "date-fns";

export function GeoRewardMap() {
  const prefersReducedMotion = useReducedMotion();

  const { data: partners, isLoading } = useQuery({
    queryKey: ['geo-reward-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_reward_partners')
        .select('*')
        .eq('is_active', true)
        .order('current_multiplier', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !partners || partners.length === 0) return null;

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 3) return 'text-accent';
    if (multiplier >= 2) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getBonusIcon = (bonusType: string) => {
    switch (bonusType) {
      case 'points': return '⭐';
      case 'cashback': return '💰';
      case 'freeze_day': return '🛡️';
      default: return '🎁';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Nearby Reward Boosters</h3>
      </div>

      <div className="space-y-3">
        {partners.map((partner, index) => {
          const isActive = partner.multiplier_end_time && new Date(partner.multiplier_end_time) > new Date();
          const timeRemaining = partner.multiplier_end_time 
            ? formatDistanceToNow(new Date(partner.multiplier_end_time), { addSuffix: true })
            : null;

          return (
            <motion.div
              key={partner.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card className="p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                {/* Pulse effect for active multipliers */}
                {!prefersReducedMotion && isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/5"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getBonusIcon(partner.bonus_type)}</span>
                      <h4 className="font-medium text-foreground">{partner.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{partner.category}</p>
                    {partner.address && (
                      <p className="text-xs text-muted-foreground mt-1">{partner.address}</p>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    <div className={`text-lg font-bold ${getMultiplierColor(Number(partner.current_multiplier))}`}>
                      {partner.current_multiplier}x
                    </div>
                    {isActive && timeRemaining && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{timeRemaining}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">Eligible for {partner.bonus_type} bonus</span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

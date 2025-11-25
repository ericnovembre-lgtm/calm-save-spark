import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useGeoRewardRealtime() {
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        channel = supabase
          .channel('geo-reward-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'geo_reward_partners'
            },
            (payload) => {
              console.log('Geo-reward update:', payload);

              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const partner = payload.new as any;
                
                // Notify about active multipliers
                if (partner.is_active && partner.current_multiplier > 1.0 && partner.multiplier_end_time) {
                  const endTime = new Date(partner.multiplier_end_time);
                  const now = new Date();
                  
                  if (endTime > now) {
                    const hoursLeft = Math.round((endTime.getTime() - now.getTime()) / (1000 * 60 * 60));
                    
                    toast.success(`🎯 ${partner.current_multiplier}x Boost Active!`, {
                      description: `${partner.name} - ${partner.category}. Ends in ${hoursLeft}h. Earn bonus ${partner.bonus_type}!`,
                      duration: 8000,
                    });
                  }
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('Geo-reward realtime status:', status);
          });

      } catch (error) {
        console.error('Geo-reward realtime setup error:', error);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
}

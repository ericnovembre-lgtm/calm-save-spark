import { useEffect, useState, useCallback, useRef } from 'react';
import { useGeolocation } from './useGeolocation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/lib/geo-utils';
import { toast } from 'sonner';
import { useCelebrationSounds } from './useCelebrationSounds';
import { useHapticFeedback } from './useHapticFeedback';

const PROXIMITY_THRESHOLD_MILES = 0.5; // Trigger notification within 0.5 miles
const EXIT_THRESHOLD_MILES = 1.0; // Reset cooldown when > 1 mile away
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown per partner

export function useGeoRewardProximity(enabled: boolean = false) {
  const [notifiedPartners, setNotifiedPartners] = useState<Set<string>>(new Set());
  const cooldownTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { playSuccessChime } = useCelebrationSounds();
  const { triggerHaptic } = useHapticFeedback();

  // Enable continuous location watching
  const geolocation = useGeolocation({ 
    watch: enabled,
    enableHighAccuracy: true,
    maximumAge: 10000, // 10 seconds
  });

  // Fetch active geo-reward partners
  const { data: partners } = useQuery({
    queryKey: ['geo-reward-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_reward_partners')
        .select('*')
        .eq('is_active', true)
        .gte('current_multiplier', 1.0);

      if (error) throw error;
      return data;
    },
    enabled,
    refetchInterval: 30000, // Refresh partners every 30 seconds
  });

  const clearCooldown = useCallback((partnerId: string) => {
    const timer = cooldownTimers.current.get(partnerId);
    if (timer) {
      clearTimeout(timer);
      cooldownTimers.current.delete(partnerId);
    }
  }, []);

  const setCooldown = useCallback((partnerId: string) => {
    clearCooldown(partnerId);
    const timer = setTimeout(() => {
      setNotifiedPartners(prev => {
        const next = new Set(prev);
        next.delete(partnerId);
        return next;
      });
      cooldownTimers.current.delete(partnerId);
    }, COOLDOWN_MS);
    cooldownTimers.current.set(partnerId, timer);
  }, [clearCooldown]);

  // Monitor proximity
  useEffect(() => {
    if (!enabled || !geolocation.isGranted || !partners || !geolocation.latitude || !geolocation.longitude) {
      return;
    }

    partners.forEach(partner => {
      const distance = calculateDistance(
        geolocation.latitude!,
        geolocation.longitude!,
        partner.latitude,
        partner.longitude
      );

      // Entered proximity zone
      if (distance <= PROXIMITY_THRESHOLD_MILES && !notifiedPartners.has(partner.id)) {
        console.log(`📍 Entered proximity zone for ${partner.name} (${distance.toFixed(2)} mi)`);
        
        // Trigger notification
        const multiplierText = partner.current_multiplier > 1.0 
          ? `${partner.current_multiplier}x Boost Active!` 
          : 'Rewards Available';
        
        toast.success(`🎯 ${partner.name}`, {
          description: `${distance.toFixed(1)} mi away • ${multiplierText} • Earn bonus ${partner.bonus_type}`,
          duration: 8000,
        });

        playSuccessChime();
        triggerHaptic('medium');

        // Mark as notified and set cooldown
        setNotifiedPartners(prev => new Set(prev).add(partner.id));
        setCooldown(partner.id);
      }

      // Exited zone - reset cooldown
      if (distance > EXIT_THRESHOLD_MILES && notifiedPartners.has(partner.id)) {
        console.log(`📍 Exited zone for ${partner.name} (${distance.toFixed(2)} mi) - resetting cooldown`);
        setNotifiedPartners(prev => {
          const next = new Set(prev);
          next.delete(partner.id);
          return next;
        });
        clearCooldown(partner.id);
      }
    });
  }, [
    enabled,
    geolocation.latitude,
    geolocation.longitude,
    geolocation.isGranted,
    partners,
    notifiedPartners,
    setCooldown,
    clearCooldown,
    playSuccessChime,
    triggerHaptic,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cooldownTimers.current.forEach(timer => clearTimeout(timer));
      cooldownTimers.current.clear();
    };
  }, []);

  return {
    isTracking: enabled && geolocation.isGranted && geolocation.isLoading === false,
    location: geolocation,
    notifiedPartners: Array.from(notifiedPartners),
  };
}

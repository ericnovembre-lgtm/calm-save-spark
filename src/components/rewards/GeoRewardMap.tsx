import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Zap, Locate, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatDistanceToNow } from "date-fns";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistance, formatDistance } from "@/lib/geo-utils";
import { useMemo } from "react";

export function GeoRewardMap() {
  const prefersReducedMotion = useReducedMotion();
  const { latitude, longitude, status, error, refetch, isGranted, isDenied } = useGeolocation();

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

  // Sort partners by distance if location is available
  const sortedPartners = useMemo(() => {
    if (!partners || !isGranted || !latitude || !longitude) return partners;
    
    return [...partners]
      .map(partner => ({
        ...partner,
        distance: calculateDistance(
          latitude,
          longitude,
          Number(partner.latitude),
          Number(partner.longitude)
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [partners, isGranted, latitude, longitude]);

  if (isLoading || !sortedPartners || sortedPartners.length === 0) return null;

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Nearby Loot</h3>
            <p className="text-sm text-muted-foreground">
              {isGranted 
                ? 'Sorted by distance from your location' 
                : 'Enable location to see nearest rewards'}
            </p>
          </div>
        </div>
        
        {/* Location status indicator */}
        {isDenied && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="gap-2"
          >
            <Locate className="w-4 h-4" />
            Enable Location
          </Button>
        )}
        
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Locate className="w-4 h-4" />
            </motion.div>
            Calculating...
          </div>
        )}
      </div>

      {/* Permission error message */}
      {isDenied && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Location access needed</p>
              <p className="text-muted-foreground">
                Enable location permissions to see accurate distances and find the closest reward partners near you.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Horizontal scroll container */}
      <div className="relative -mx-4 px-4">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {sortedPartners.map((partner, index) => {
          const isActive = partner.multiplier_end_time && new Date(partner.multiplier_end_time) > new Date();
          const timeRemaining = partner.multiplier_end_time 
            ? formatDistanceToNow(new Date(partner.multiplier_end_time), { addSuffix: true })
            : null;
          const hoursRemaining = partner.multiplier_end_time
            ? (new Date(partner.multiplier_end_time).getTime() - new Date().getTime()) / (1000 * 60 * 60)
            : 0;
          const isExpiringSoon = hoursRemaining < 4 && hoursRemaining > 0;
          
          // Real distance calculation
          const distance = isGranted && latitude && longitude && partner.latitude && partner.longitude
            ? calculateDistance(latitude, longitude, Number(partner.latitude), Number(partner.longitude))
            : null;
          const displayDistance = distance !== null ? formatDistance(distance) : 'Distance unknown';
          
          const getRarityStyle = (multiplier: number) => {
            if (multiplier >= 3) return 'from-amber-500/20 to-yellow-500/20 border-amber-500/30';
            if (multiplier >= 2) return 'from-primary/20 to-blue-500/20 border-primary/30';
            return 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
          };

          return (
            <motion.div
              key={partner.id}
              className="flex-shrink-0 w-72 snap-start"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card className={`p-5 relative overflow-hidden h-full bg-gradient-to-br ${getRarityStyle(Number(partner.current_multiplier))} hover:shadow-lg transition-all`}>
                {/* Expiring soon pulse - more aggressive */}
                {!prefersReducedMotion && isExpiringSoon && (
                  <motion.div
                    className="absolute inset-0 bg-amber-500/20"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                
                {/* Active pulse */}
                {!prefersReducedMotion && isActive && !isExpiringSoon && (
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

                <div className="relative space-y-3">
                  {/* LOOT label */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      Number(partner.current_multiplier) >= 3 
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                        : 'bg-primary/20 text-primary border border-primary/30'
                    }`}>
                      LOOT
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getBonusIcon(partner.bonus_type)}</span>
                        <div>
                          <h4 className="font-semibold text-foreground">{partner.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{partner.category}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getMultiplierColor(Number(partner.current_multiplier))}`}>
                        {partner.current_multiplier}x
                      </div>
                    </div>
                  </div>

                  {/* Distance indicator */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className={`font-medium ${distance !== null ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {displayDistance}
                    </span>
                  </div>

                  {partner.address && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{partner.address}</p>
                  )}

                  {/* Time remaining with emphasis on expiring */}
                  {isActive && timeRemaining && (
                    <div className={`flex items-center gap-2 text-sm ${isExpiringSoon ? 'text-amber-500 font-semibold' : 'text-muted-foreground'}`}>
                      <Clock className={`w-4 h-4 ${isExpiringSoon ? 'animate-pulse' : ''}`} />
                      <span>
                        {isExpiringSoon ? '⚡ ' : ''}
                        Expires {timeRemaining}
                      </span>
                    </div>
                  )}

                  {isActive && (
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">Active bonus: {partner.bonus_type}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

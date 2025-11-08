import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  badge_color?: string;
  points: number;
}

export function useAchievementNotifications() {
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Subscribe to new achievements
    const channel = supabase
      .channel('user_achievements_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
        },
        async (payload) => {
          console.log('New achievement detected:', payload);

          // Fetch achievement details
          const { data: achievement } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', payload.new.achievement_id)
            .single();

          if (achievement) {
            setNewAchievements(prev => [...prev, achievement]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismissAchievements = () => {
    setNewAchievements([]);
  };

  return {
    newAchievements,
    dismissAchievements,
  };
}
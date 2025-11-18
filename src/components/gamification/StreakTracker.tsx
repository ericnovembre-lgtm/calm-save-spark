import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Snowflake, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function StreakTracker() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, total_check_ins, last_activity_date, streak_freeze_available')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isStreakActive = profile?.last_activity_date && 
    new Date(profile.last_activity_date).toDateString() === new Date().toDateString();

  const streakColor = profile?.current_streak || 0 >= 30 ? 'text-orange-500' :
                      profile?.current_streak || 0 >= 14 ? 'text-yellow-500' :
                      profile?.current_streak || 0 >= 7 ? 'text-blue-500' :
                      'text-muted-foreground';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className={`w-6 h-6 ${streakColor}`} />
          <h3 className="text-lg font-semibold">Your Streak</h3>
        </div>
        {isStreakActive && (
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Active Today
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <motion.div 
          className="text-center p-3 bg-muted/50 rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className={`w-5 h-5 ${streakColor}`} />
            <p className={`text-2xl font-bold ${streakColor}`}>
              {profile?.current_streak || 0}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </motion.div>

        <motion.div 
          className="text-center p-3 bg-muted/50 rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">
              {profile?.longest_streak || 0}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </motion.div>

        <motion.div 
          className="text-center p-3 bg-muted/50 rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-5 h-5 text-primary" />
            <p className="text-2xl font-bold text-primary">
              {profile?.total_check_ins || 0}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Total Check-ins</p>
        </motion.div>
      </div>

      {profile?.streak_freeze_available && profile.streak_freeze_available > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Snowflake className="w-5 h-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Streak Freeze Available</p>
            <p className="text-xs text-muted-foreground">
              {profile.streak_freeze_available} {profile.streak_freeze_available === 1 ? 'day' : 'days'} saved
            </p>
          </div>
          <Button size="sm" variant="outline">Use Freeze</Button>
        </div>
      )}

      {!isStreakActive && (
        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <p className="text-sm text-yellow-600 text-center">
            📅 Check in today to continue your streak!
          </p>
        </div>
      )}
    </Card>
  );
}

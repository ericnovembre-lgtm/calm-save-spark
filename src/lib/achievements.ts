import { supabase } from "@/integrations/supabase/client";

export type AchievementEvent = 
  | 'onboarding_completed'
  | 'transfer_completed'
  | 'goal_completed'
  | 'automation_created'
  | 'account_connected';

export interface AchievementMetadata {
  amount?: number;
  goal_id?: string;
  automation_id?: string;
  accounts?: number;
  [key: string]: any;
}

/**
 * Trigger achievement check for a specific event
 * This will check if the user has earned any new achievements
 */
export async function checkAchievements(
  eventType: AchievementEvent,
  metadata: AchievementMetadata = {}
) {
  try {
    const { data, error } = await supabase.functions.invoke('check-achievements', {
      body: {
        event_type: eventType,
        metadata,
      },
    });

    if (error) {
      console.error('Error checking achievements:', error);
      return { success: false, newAchievements: [] };
    }

    return {
      success: true,
      newAchievements: data.new_achievements || [],
    };
  } catch (error) {
    console.error('Error checking achievements:', error);
    return { success: false, newAchievements: [] };
  }
}

/**
 * Get user's current achievement stats
 */
export async function getUserAchievementStats() {
  try {
    const [achievementsResult, streaksResult] = await Promise.all([
      supabase
        .from('user_achievements')
        .select('achievements(points)')
        .then(({ data }) => data),
      
      supabase
        .from('user_streaks')
        .select('*')
        .eq('streak_type', 'daily_save')
        .single()
        .then(({ data }) => data),
    ]);

    const totalPoints = achievementsResult?.reduce(
      (sum, a) => sum + (a.achievements?.points || 0), 
      0
    ) || 0;

    return {
      totalAchievements: achievementsResult?.length || 0,
      totalPoints,
      currentStreak: streaksResult?.current_streak || 0,
      longestStreak: streaksResult?.longest_streak || 0,
    };
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    return {
      totalAchievements: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }
}
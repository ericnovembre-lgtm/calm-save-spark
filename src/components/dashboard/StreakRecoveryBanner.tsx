import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Flame } from "lucide-react";
import { differenceInHours } from "date-fns";

export function StreakRecoveryBanner() {
  const { data: profile } = useQuery({
    queryKey: ["profile-streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("current_streak, last_activity_date")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (!profile?.last_activity_date) return null;

  const lastActivity = new Date(profile.last_activity_date);
  const hoursSinceActivity = differenceInHours(new Date(), lastActivity);
  const isInRecoveryWindow = hoursSinceActivity >= 24 && hoursSinceActivity < 48;

  if (!isInRecoveryWindow) return null;

  const hoursRemaining = 48 - hoursSinceActivity;

  return (
    <Alert className="border-orange-500/50 bg-orange-500/10">
      <AlertCircle className="h-4 w-4 text-orange-500" />
      <AlertTitle className="flex items-center gap-2">
        <Flame className="h-4 w-4" />
        Streak Recovery Active
      </AlertTitle>
      <AlertDescription>
        You have <strong>{hoursRemaining} hours</strong> remaining to make a transfer and maintain your{" "}
        <strong>{profile.current_streak}-day streak</strong>! The 24-hour grace period is active.
      </AlertDescription>
    </Alert>
  );
}

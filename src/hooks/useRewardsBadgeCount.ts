import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RewardsBadgeData {
  badgeCount: number;
  hasNewOptions: boolean;
}

export function useRewardsBadgeCount(): RewardsBadgeData {
  const { data } = useQuery({
    queryKey: ["rewards-badge-count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { badgeCount: 0, hasNewOptions: false };

      // Fetch user's total points from card_points_ledger
      const { data: pointsData } = await supabase
        .from("card_points_ledger")
        .select("points_amount")
        .eq("user_id", user.id);

      const userPoints = pointsData?.reduce((sum, p) => sum + (p.points_amount || 0), 0) || 0;

      // Fetch redemption catalog items user can afford (using min_points)
      const { data: catalog } = await supabase
        .from("redemption_catalog")
        .select("id, points_cost, min_points")
        .eq("is_active", true);

      // Fetch already redeemed items
      const { data: redeemed } = await supabase
        .from("points_redemptions")
        .select("catalog_item_id")
        .eq("user_id", user.id);

      const redeemedIds = new Set(redeemed?.map(r => r.catalog_item_id) || []);

      // Count unredeemed items user can afford (check min_points or points_cost)
      const unredeemedAffordable = catalog?.filter(item => {
        const requiredPoints = item.min_points || item.points_cost || 0;
        return userPoints >= requiredPoints && !redeemedIds.has(item.id);
      }) || [];
      
      return {
        badgeCount: unredeemedAffordable.length,
        hasNewOptions: unredeemedAffordable.length > 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  return data || { badgeCount: 0, hasNewOptions: false };
}

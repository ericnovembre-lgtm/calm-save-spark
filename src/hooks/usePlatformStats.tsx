import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import type { Stat } from "@/components/welcome/types";

interface PlatformStat {
  stat_key: string;
  stat_value: number;
  stat_metadata: Record<string, any>;
  last_updated: string;
}

/**
 * Hook to fetch real-time platform statistics from the database
 * Falls back to static values if database fetch fails
 */
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_stats')
        .select('stat_key, stat_value, stat_metadata, last_updated')
        .in('stat_key', [
          'total_users',
          'total_saved', 
          'average_apy',
          'users_this_month',
          'users_this_week',
          'users_today'
        ]);

      if (error) throw error;
      return data as PlatformStat[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Transform raw platform stats into Stat objects for display
 */
export const transformPlatformStats = (stats: PlatformStat[] | undefined): Stat[] => {
  if (!stats || stats.length === 0) {
    // Fallback to static data
    return [
      {
        label: "Active Savers",
        value: 50000,
        suffix: "+",
        icon: <Users className="w-8 h-8" />,
        delay: 0,
        breakdown: [
          { label: "This Month", value: "2,340", percentage: 75 },
          { label: "This Week", value: "580", percentage: 45 },
          { label: "Today", value: "120", percentage: 25 },
        ],
      },
      {
        label: "Total Saved",
        value: 2.1,
        suffix: "M+",
        icon: <DollarSign className="w-8 h-8" />,
        delay: 0.1,
        breakdown: [
          { label: "Automated Savings", value: "$1.2M", percentage: 57 },
          { label: "Round-ups", value: "$600K", percentage: 28 },
          { label: "Manual Transfers", value: "$300K", percentage: 15 },
        ],
      },
      {
        label: "Average APY",
        value: 4.25,
        suffix: "%",
        icon: <TrendingUp className="w-8 h-8" />,
        delay: 0.2,
      },
    ];
  }

  const statsMap = new Map(stats.map(s => [s.stat_key, s]));
  
  const totalUsers = statsMap.get('total_users');
  const totalSaved = statsMap.get('total_saved');
  const averageApy = statsMap.get('average_apy');
  const usersThisMonth = statsMap.get('users_this_month');
  const usersThisWeek = statsMap.get('users_this_week');
  const usersToday = statsMap.get('users_today');

  // Calculate percentages for breakdown
  const totalUserValue = totalUsers?.stat_value || 50000;
  const monthValue = usersThisMonth?.stat_value || 2340;
  const weekValue = usersThisWeek?.stat_value || 580;
  const todayValue = usersToday?.stat_value || 120;

  const monthPercentage = totalUserValue > 0 ? Math.round((monthValue / totalUserValue) * 100) : 75;
  const weekPercentage = monthValue > 0 ? Math.round((weekValue / monthValue) * 100) : 45;
  const todayPercentage = weekValue > 0 ? Math.round((todayValue / weekValue) * 100) : 25;

  // Format total saved value (convert to millions)
  const savedValue = totalSaved?.stat_value || 2100000;
  const savedInMillions = savedValue / 1000000;

  return [
    {
      label: "Active Savers",
      value: totalUserValue,
      suffix: "+",
      icon: <Users className="w-8 h-8" />,
      delay: 0,
      breakdown: [
        { 
          label: "This Month", 
          value: monthValue.toLocaleString(), 
          percentage: monthPercentage 
        },
        { 
          label: "This Week", 
          value: weekValue.toLocaleString(), 
          percentage: weekPercentage 
        },
        { 
          label: "Today", 
          value: todayValue.toLocaleString(), 
          percentage: todayPercentage 
        },
      ],
    },
    {
      label: "Total Saved",
      value: Number(savedInMillions.toFixed(1)),
      suffix: "M+",
      icon: <DollarSign className="w-8 h-8" />,
      delay: 0.1,
      breakdown: [
        { label: "Automated Savings", value: "$1.2M", percentage: 57 },
        { label: "Round-ups", value: "$600K", percentage: 28 },
        { label: "Manual Transfers", value: "$300K", percentage: 15 },
      ],
    },
    {
      label: "Average APY",
      value: averageApy?.stat_value || 4.25,
      suffix: "%",
      icon: <TrendingUp className="w-8 h-8" />,
      delay: 0.2,
    },
  ];
};

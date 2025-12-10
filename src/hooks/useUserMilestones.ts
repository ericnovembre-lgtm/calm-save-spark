import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_type: string;
  milestone_name: string;
  milestone_description: string | null;
  milestone_icon: string | null;
  completed_at: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export function useUserMilestones() {
  const { session } = useAuth();

  const { data: milestones, isLoading, error, refetch } = useQuery({
    queryKey: ['user-milestones', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserMilestone[];
    },
    enabled: !!session?.user?.id,
  });

  const milestonesByType = milestones?.reduce((acc, milestone) => {
    const type = milestone.milestone_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(milestone);
    return acc;
  }, {} as Record<string, UserMilestone[]>) || {};

  const milestonesByYear = milestones?.reduce((acc, milestone) => {
    const year = new Date(milestone.completed_at).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(milestone);
    return acc;
  }, {} as Record<string, UserMilestone[]>) || {};

  return {
    milestones: milestones || [],
    milestonesByType,
    milestonesByYear,
    isLoading,
    error,
    refetch,
    totalCount: milestones?.length || 0,
  };
}

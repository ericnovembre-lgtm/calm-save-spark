import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AssetBreakdown {
  cash?: number;
  savings?: number;
  investments?: number;
  property?: number;
  vehicles?: number;
  other?: number;
}

export interface LiabilityBreakdown {
  credit_cards?: number;
  mortgages?: number;
  student_loans?: number;
  car_loans?: number;
  personal_loans?: number;
  other?: number;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  asset_breakdown: AssetBreakdown;
  liability_breakdown: LiabilityBreakdown;
  snapshot_type: 'automatic' | 'manual';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useNetWorthSnapshots() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: snapshots, isLoading, error, refetch } = useQuery({
    queryKey: ['net-worth-snapshots', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('net_worth_snapshots')
        .select('*')
        .eq('user_id', session.user.id)
        .order('snapshot_date', { ascending: false })
        .limit(365);

      if (error) throw error;
      return data as NetWorthSnapshot[];
    },
    enabled: !!session?.user?.id,
  });

  const latestSnapshot = snapshots?.[0] ?? null;
  const previousSnapshot = snapshots?.[1] ?? null;

  const changeFromPrevious = latestSnapshot && previousSnapshot
    ? latestSnapshot.net_worth - previousSnapshot.net_worth
    : 0;

  const changePercentage = previousSnapshot && previousSnapshot.net_worth !== 0
    ? ((latestSnapshot?.net_worth ?? 0) - previousSnapshot.net_worth) / Math.abs(previousSnapshot.net_worth) * 100
    : 0;

  const createSnapshot = useMutation({
    mutationFn: async (data: {
      total_assets: number;
      total_liabilities: number;
      asset_breakdown?: AssetBreakdown;
      liability_breakdown?: LiabilityBreakdown;
      notes?: string;
      snapshot_type?: 'automatic' | 'manual';
    }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const net_worth = data.total_assets - data.total_liabilities;
      const today = new Date().toISOString().split('T')[0];

      // First try to get existing snapshot for today
      const { data: existing } = await supabase
        .from('net_worth_snapshots')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('snapshot_date', today)
        .single();

      let snapshot;
      let error;

      if (existing) {
        // Update existing
        const result = await supabase
          .from('net_worth_snapshots')
          .update({
            total_assets: data.total_assets,
            total_liabilities: data.total_liabilities,
            net_worth,
            asset_breakdown: data.asset_breakdown ?? {},
            liability_breakdown: data.liability_breakdown ?? {},
            snapshot_type: data.snapshot_type ?? 'manual',
            notes: data.notes,
          })
          .eq('id', existing.id)
          .select()
          .single();
        snapshot = result.data;
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('net_worth_snapshots')
          .insert({
            user_id: session.user.id,
            snapshot_date: today,
            total_assets: data.total_assets,
            total_liabilities: data.total_liabilities,
            net_worth,
            asset_breakdown: data.asset_breakdown ?? {},
            liability_breakdown: data.liability_breakdown ?? {},
            snapshot_type: data.snapshot_type ?? 'manual',
            notes: data.notes,
          })
          .select()
          .single();
        snapshot = result.data;
        error = result.error;
      }

      if (error) throw error;
      return snapshot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth-milestones'] });
      toast.success('Net worth snapshot saved');
    },
    onError: (error) => {
      toast.error('Failed to save snapshot: ' + error.message);
    },
  });

  // Calculate trends over time periods
  const getSnapshotFromDaysAgo = (days: number): NetWorthSnapshot | null => {
    if (!snapshots?.length) return null;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    
    return snapshots.find(s => {
      const snapshotDate = new Date(s.snapshot_date);
      return snapshotDate <= targetDate;
    }) ?? null;
  };

  const weekAgoSnapshot = getSnapshotFromDaysAgo(7);
  const monthAgoSnapshot = getSnapshotFromDaysAgo(30);
  const yearAgoSnapshot = getSnapshotFromDaysAgo(365);

  const weekChange = latestSnapshot && weekAgoSnapshot
    ? latestSnapshot.net_worth - weekAgoSnapshot.net_worth
    : 0;

  const monthChange = latestSnapshot && monthAgoSnapshot
    ? latestSnapshot.net_worth - monthAgoSnapshot.net_worth
    : 0;

  const yearChange = latestSnapshot && yearAgoSnapshot
    ? latestSnapshot.net_worth - yearAgoSnapshot.net_worth
    : 0;

  return {
    snapshots: snapshots ?? [],
    latestSnapshot,
    previousSnapshot,
    changeFromPrevious,
    changePercentage,
    weekChange,
    monthChange,
    yearChange,
    isLoading,
    error,
    refetch,
    createSnapshot,
  };
}

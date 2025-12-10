import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

export interface TaxLot {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  cost_basis: number;
  current_price: number | null;
  unrealized_gain_loss: number | null;
  is_sold: boolean;
  sold_date: string | null;
  sold_price: number | null;
  realized_gain_loss: number | null;
  account_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed in app
  holding_period: 'short_term' | 'long_term';
  days_held: number;
}

export interface HarvestQueueItem {
  id: string;
  user_id: string;
  tax_lot_id: string;
  action_type: 'harvest' | 'defer' | 'ignore';
  estimated_tax_savings: number | null;
  replacement_symbol: string | null;
  wash_sale_clear_date: string | null;
  status: 'pending' | 'executed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  tax_lot?: TaxLot;
}

export interface CreateTaxLotInput {
  symbol: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  account_name?: string;
  notes?: string;
}

function computeHoldingPeriod(purchaseDate: string): { holding_period: 'short_term' | 'long_term'; days_held: number } {
  const days = differenceInDays(new Date(), new Date(purchaseDate));
  return {
    holding_period: days >= 365 ? 'long_term' : 'short_term',
    days_held: days,
  };
}

export function useTaxLots() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: taxLots, isLoading, error } = useQuery({
    queryKey: ['tax_lots', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('investment_tax_lots')
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;

      // Compute holding period for each lot
      return (data || []).map(lot => ({
        ...lot,
        ...computeHoldingPeriod(lot.purchase_date),
      })) as TaxLot[];
    },
    enabled: !!user,
  });

  const createTaxLot = useMutation({
    mutationFn: async (input: CreateTaxLotInput) => {
      if (!user) throw new Error('Not authenticated');

      const cost_basis = input.quantity * input.purchase_price;

      const { data, error } = await supabase
        .from('investment_tax_lots')
        .insert([{
          ...input,
          user_id: user.id,
          cost_basis,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_lots'] });
      toast.success('Tax lot added');
    },
    onError: (error) => {
      console.error('Error creating tax lot:', error);
      toast.error('Failed to add tax lot');
    },
  });

  const updateTaxLot = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxLot> & { id: string }) => {
      const { data, error } = await supabase
        .from('investment_tax_lots')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_lots'] });
      toast.success('Tax lot updated');
    },
    onError: (error) => {
      console.error('Error updating tax lot:', error);
      toast.error('Failed to update tax lot');
    },
  });

  const deleteTaxLot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investment_tax_lots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_lots'] });
      toast.success('Tax lot deleted');
    },
    onError: (error) => {
      console.error('Error deleting tax lot:', error);
      toast.error('Failed to delete tax lot');
    },
  });

  // Group by symbol
  const lotsBySymbol = (taxLots || []).reduce((acc, lot) => {
    if (!acc[lot.symbol]) {
      acc[lot.symbol] = [];
    }
    acc[lot.symbol].push(lot);
    return acc;
  }, {} as Record<string, TaxLot[]>);

  // Calculate analytics
  const analytics = {
    totalUnrealizedGain: (taxLots || [])
      .filter(l => !l.is_sold)
      .reduce((sum, l) => sum + (l.unrealized_gain_loss || 0), 0),
    totalRealizedGain: (taxLots || [])
      .filter(l => l.is_sold)
      .reduce((sum, l) => sum + (l.realized_gain_loss || 0), 0),
    shortTermCount: (taxLots || []).filter(l => !l.is_sold && l.holding_period === 'short_term').length,
    longTermCount: (taxLots || []).filter(l => !l.is_sold && l.holding_period === 'long_term').length,
    harvestCandidates: (taxLots || []).filter(l => !l.is_sold && (l.unrealized_gain_loss || 0) < 0),
  };

  return {
    taxLots: taxLots || [],
    lotsBySymbol,
    analytics,
    isLoading,
    error,
    createTaxLot: createTaxLot.mutate,
    isCreating: createTaxLot.isPending,
    updateTaxLot: updateTaxLot.mutate,
    isUpdating: updateTaxLot.isPending,
    deleteTaxLot: deleteTaxLot.mutate,
    isDeleting: deleteTaxLot.isPending,
  };
}

export function useHarvestQueue() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: queue, isLoading, error } = useQuery({
    queryKey: ['harvest_queue', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('tax_lot_harvesting_queue')
        .select('*, investment_tax_lots(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HarvestQueueItem[];
    },
    enabled: !!user,
  });

  const addToQueue = useMutation({
    mutationFn: async (input: { tax_lot_id: string; action_type: 'harvest' | 'defer' | 'ignore'; estimated_tax_savings?: number; replacement_symbol?: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Calculate wash sale clear date (30 days from now)
      const washSaleClearDate = new Date();
      washSaleClearDate.setDate(washSaleClearDate.getDate() + 30);

      const { data, error } = await supabase
        .from('tax_lot_harvesting_queue')
        .insert([{
          ...input,
          user_id: user.id,
          wash_sale_clear_date: washSaleClearDate.toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvest_queue'] });
      toast.success('Added to harvest queue');
    },
    onError: (error) => {
      console.error('Error adding to queue:', error);
      toast.error('Failed to add to queue');
    },
  });

  const updateQueueItem = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'executed' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('tax_lot_harvesting_queue')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvest_queue'] });
      toast.success('Queue updated');
    },
    onError: (error) => {
      console.error('Error updating queue:', error);
      toast.error('Failed to update queue');
    },
  });

  return {
    queue: queue || [],
    pendingItems: (queue || []).filter(q => q.status === 'pending'),
    isLoading,
    error,
    addToQueue: addToQueue.mutate,
    isAdding: addToQueue.isPending,
    updateQueueItem: updateQueueItem.mutate,
    isUpdating: updateQueueItem.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type IncomeSourceType = 'salary' | 'freelance' | 'investment' | 'rental' | 'business' | 'side_hustle' | 'pension' | 'benefits' | 'gift' | 'other';
export type IncomeFrequency = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'annually';

export interface IncomeEntry {
  id: string;
  user_id: string;
  source_name: string;
  source_type: IncomeSourceType;
  amount: number;
  frequency: IncomeFrequency;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  currency: string;
  tax_withheld: number;
  is_taxable: boolean;
  account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIncomeEntry {
  source_name: string;
  source_type: IncomeSourceType;
  amount: number;
  frequency: IncomeFrequency;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
  notes?: string;
  currency?: string;
  tax_withheld?: number;
  is_taxable?: boolean;
  account_id?: string | null;
}

export function useIncomeEntries() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: incomeEntries, isLoading, error, refetch } = useQuery({
    queryKey: ['income-entries', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_active', { ascending: false })
        .order('amount', { ascending: false });

      if (error) throw error;
      return data as IncomeEntry[];
    },
    enabled: !!session?.user?.id,
  });

  const addIncome = useMutation({
    mutationFn: async (entry: CreateIncomeEntry) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('income_entries')
        .insert({
          ...entry,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-entries'] });
      queryClient.invalidateQueries({ queryKey: ['income-analytics'] });
      toast.success('Income source added');
    },
    onError: (error) => {
      toast.error('Failed to add income: ' + error.message);
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IncomeEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('income_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-entries'] });
      queryClient.invalidateQueries({ queryKey: ['income-analytics'] });
      toast.success('Income updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-entries'] });
      queryClient.invalidateQueries({ queryKey: ['income-analytics'] });
      toast.success('Income source deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('income_entries')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['income-entries'] });
      queryClient.invalidateQueries({ queryKey: ['income-analytics'] });
      toast.success(data.is_active ? 'Income activated' : 'Income paused');
    },
  });

  const activeEntries = incomeEntries?.filter(e => e.is_active) ?? [];
  const inactiveEntries = incomeEntries?.filter(e => !e.is_active) ?? [];

  return {
    incomeEntries: incomeEntries ?? [],
    activeEntries,
    inactiveEntries,
    isLoading,
    error,
    refetch,
    addIncome,
    updateIncome,
    deleteIncome,
    toggleActive,
  };
}

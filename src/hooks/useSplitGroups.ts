import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

export interface SplitGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: SplitGroupMember[];
  total_expenses?: number;
  your_balance?: number;
}

export interface SplitGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  nickname: string | null;
  email: string | null;
  is_registered: boolean;
  joined_at: string;
}

export interface SplitExpense {
  id: string;
  group_id: string;
  description: string;
  total_amount: number;
  currency: string;
  paid_by: string;
  expense_date: string;
  category: string;
  receipt_url: string | null;
  notes: string | null;
  is_settled: boolean;
  created_at: string;
  participants?: SplitParticipant[];
}

export interface SplitParticipant {
  id: string;
  expense_id: string;
  member_id: string;
  share_amount: number;
  share_percentage: number | null;
  is_paid: boolean;
  paid_at: string | null;
}

export interface SplitSettlement {
  id: string;
  group_id: string;
  from_member_id: string;
  to_member_id: string;
  amount: number;
  currency: string;
  settled_at: string;
  notes: string | null;
}

export function useSplitGroups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['split-groups', user?.id],
    queryFn: async (): Promise<SplitGroup[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('split_groups')
        .select(`
          *,
          split_group_members (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate balances for each group
      const groupsWithBalances = await Promise.all(
        (data || []).map(async (group) => {
          const { data: expenses } = await supabase
            .from('split_expenses')
            .select('total_amount, paid_by')
            .eq('group_id', group.id);

          const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.total_amount), 0) || 0;
          
          // Simple balance calculation
          const paidByYou = expenses?.filter(e => e.paid_by === user.id)
            .reduce((sum, e) => sum + Number(e.total_amount), 0) || 0;
          const memberCount = group.split_group_members?.length || 1;
          const yourShare = totalExpenses / memberCount;
          const yourBalance = paidByYou - yourShare;

          return {
            ...group,
            members: group.split_group_members,
            total_expenses: totalExpenses,
            your_balance: yourBalance,
          };
        })
      );

      return groupsWithBalances;
    },
    enabled: !!user?.id,
  });
}

export function useSplitGroup(groupId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['split-group', groupId],
    queryFn: async (): Promise<SplitGroup | null> => {
      if (!groupId || !user?.id) return null;

      const { data, error } = await supabase
        .from('split_groups')
        .select(`
          *,
          split_group_members (*)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return { ...data, members: data.split_group_members };
    },
    enabled: !!groupId && !!user?.id,
  });
}

export function useSplitExpenses(groupId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['split-expenses', groupId],
    queryFn: async (): Promise<SplitExpense[]> => {
      if (!groupId || !user?.id) return [];

      const { data, error } = await supabase
        .from('split_expenses')
        .select(`
          *,
          split_participants (*)
        `)
        .eq('group_id', groupId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(e => ({ ...e, participants: e.split_participants }));
    },
    enabled: !!groupId && !!user?.id,
  });
}

export function useCreateSplitGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; icon?: string; color?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: group, error } = await supabase
        .from('split_groups')
        .insert({
          name: data.name,
          description: data.description,
          icon: data.icon || '👥',
          color: data.color || '#d6c8a2',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      await supabase
        .from('split_group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          is_registered: true,
        });

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-groups'] });
      toast.success('Group created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create group: ' + error.message);
    },
  });
}

export function useAddSplitExpense() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      group_id: string;
      description: string;
      total_amount: number;
      category?: string;
      expense_date?: string;
      participants: { member_id: string; share_amount: number }[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: expense, error } = await supabase
        .from('split_expenses')
        .insert({
          group_id: data.group_id,
          description: data.description,
          total_amount: data.total_amount,
          category: data.category || 'general',
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
          paid_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      if (data.participants.length > 0) {
        const { error: participantError } = await supabase
          .from('split_participants')
          .insert(
            data.participants.map(p => ({
              expense_id: expense.id,
              member_id: p.member_id,
              share_amount: p.share_amount,
            }))
          );

        if (participantError) throw participantError;
      }

      return expense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses', variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ['split-groups'] });
      toast.success('Expense added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add expense: ' + error.message);
    },
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { group_id: string; nickname: string; email?: string }) => {
      const { data: member, error } = await supabase
        .from('split_group_members')
        .insert({
          group_id: data.group_id,
          user_id: crypto.randomUUID(), // Placeholder for non-registered users
          nickname: data.nickname,
          email: data.email,
          is_registered: false,
        })
        .select()
        .single();

      if (error) throw error;
      return member;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['split-group', variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ['split-groups'] });
      toast.success('Member added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add member: ' + error.message);
    },
  });
}

export function useSettleUp() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      group_id: string;
      from_member_id: string;
      to_member_id: string;
      amount: number;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: settlement, error } = await supabase
        .from('split_settlements')
        .insert({
          group_id: data.group_id,
          from_member_id: data.from_member_id,
          to_member_id: data.to_member_id,
          amount: data.amount,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return settlement;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses', variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ['split-groups'] });
      toast.success('Settlement recorded');
    },
    onError: (error) => {
      toast.error('Failed to settle: ' + error.message);
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  saved_amount: number;
  currency: string;
  priority: number;
  category: string;
  image_url: string | null;
  product_url: string | null;
  target_date: string | null;
  is_purchased: boolean;
  purchased_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type WishlistSortOption = 'priority' | 'progress' | 'amount' | 'date';

export function useWishlist(sortBy: WishlistSortOption = 'priority') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist', user?.id, sortBy],
    queryFn: async (): Promise<WishlistItem[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_purchased', false);

      // Apply sorting
      switch (sortBy) {
        case 'priority':
          query = query.order('priority', { ascending: true });
          break;
        case 'amount':
          query = query.order('target_amount', { ascending: false });
          break;
        case 'date':
          query = query.order('target_date', { ascending: true, nullsFirst: false });
          break;
        case 'progress':
          // Will sort client-side
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      let items = data || [];

      // Sort by progress if needed
      if (sortBy === 'progress') {
        items = items.sort((a, b) => {
          const progressA = a.target_amount > 0 ? a.saved_amount / a.target_amount : 0;
          const progressB = b.target_amount > 0 ? b.saved_amount / b.target_amount : 0;
          return progressB - progressA;
        });
      }

      return items;
    },
    enabled: !!user?.id,
  });
}

export function useWishlistStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('wishlist_items')
        .select('target_amount, saved_amount, is_purchased, priority')
        .eq('user_id', user.id);

      if (error) throw error;

      const items = data || [];
      const activeItems = items.filter(i => !i.is_purchased);
      const purchasedItems = items.filter(i => i.is_purchased);

      const totalTarget = activeItems.reduce((sum, i) => sum + Number(i.target_amount), 0);
      const totalSaved = activeItems.reduce((sum, i) => sum + Number(i.saved_amount), 0);
      const highPriorityCount = activeItems.filter(i => i.priority <= 2).length;

      return {
        totalItems: activeItems.length,
        purchasedCount: purchasedItems.length,
        totalTarget,
        totalSaved,
        overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
        highPriorityCount,
        remainingToSave: totalTarget - totalSaved,
      };
    },
    enabled: !!user?.id,
  });
}

export function useCreateWishlistItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      target_amount: number;
      priority?: number;
      category?: string;
      image_url?: string;
      product_url?: string;
      target_date?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: item, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          target_amount: data.target_amount,
          priority: data.priority || 3,
          category: data.category || 'general',
          image_url: data.image_url,
          product_url: data.product_url,
          target_date: data.target_date,
        })
        .select()
        .single();

      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-stats'] });
      toast.success('Item added to wishlist');
    },
    onError: (error) => {
      toast.error('Failed to add item: ' + error.message);
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      description?: string;
      target_amount?: number;
      saved_amount?: number;
      priority?: number;
      category?: string;
      image_url?: string;
      product_url?: string;
      target_date?: string;
    }) => {
      const { id, ...updates } = data;
      const { data: item, error } = await supabase
        .from('wishlist_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-stats'] });
      toast.success('Item updated');
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + error.message);
    },
  });
}

export function useAddToWishlistSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; amount: number }) => {
      // First get current saved amount
      const { data: current, error: fetchError } = await supabase
        .from('wishlist_items')
        .select('saved_amount, target_amount')
        .eq('id', data.id)
        .single();

      if (fetchError) throw fetchError;

      const newAmount = Number(current.saved_amount) + data.amount;
      const isPurchased = newAmount >= Number(current.target_amount);

      const { data: item, error } = await supabase
        .from('wishlist_items')
        .update({
          saved_amount: newAmount,
          is_purchased: isPurchased,
          purchased_at: isPurchased ? new Date().toISOString() : null,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return item;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-stats'] });
      if (item.is_purchased) {
        toast.success('🎉 Congratulations! You can now purchase this item!');
      } else {
        toast.success('Savings added');
      }
    },
    onError: (error) => {
      toast.error('Failed to add savings: ' + error.message);
    },
  });
}

export function useMarkAsPurchased() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: item, error } = await supabase
        .from('wishlist_items')
        .update({
          is_purchased: true,
          purchased_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-stats'] });
      toast.success('Item marked as purchased!');
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + error.message);
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-stats'] });
      toast.success('Item removed from wishlist');
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + error.message);
    },
  });
}

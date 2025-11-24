import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WalletContact {
  id: string;
  user_id: string;
  address: string;
  name: string;
  chain: string;
  last_transaction_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useWalletContacts() {
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['wallet-contacts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallet_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('last_transaction_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const addOrUpdateContact = useMutation({
    mutationFn: async ({ address, name, chain = 'ethereum' }: { address: string; name?: string; chain?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to update existing contact
      const { data: existing } = await supabase
        .from('wallet_contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('address', address)
        .single();

      if (existing) {
        // Update existing contact
        const { error } = await supabase
          .from('wallet_contacts')
          .update({
            last_transaction_at: new Date().toISOString(),
            name: name || existing.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new contact
        const { error } = await supabase
          .from('wallet_contacts')
          .insert({
            user_id: user.id,
            address,
            name: name || address.slice(0, 10),
            chain,
            last_transaction_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-contacts'] });
    },
  });

  const updateName = useMutation({
    mutationFn: async ({ contactId, name }: { contactId: string; name: string }) => {
      const { error } = await supabase
        .from('wallet_contacts')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-contacts'] });
      toast.success('Contact name updated');
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('wallet_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-contacts'] });
      toast.success('Contact deleted');
    },
  });

  return {
    contacts: contacts || [],
    isLoading,
    addOrUpdateContact: addOrUpdateContact.mutate,
    updateName: updateName.mutate,
    deleteContact: deleteContact.mutate,
  };
}
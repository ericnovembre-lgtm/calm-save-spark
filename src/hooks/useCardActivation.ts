import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActivateCardParams {
  cardId: string;
  last4: string;
  cvv: string;
  zipCode: string;
}

export function useCardActivation() {
  const queryClient = useQueryClient();

  const activateCard = useMutation({
    mutationFn: async (params: ActivateCardParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify card details
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', params.cardId)
        .eq('user_id', user.id)
        .single();

      if (cardError || !card) throw new Error('Card not found');
      if (card.activated_at) throw new Error('Card already activated');

      // Verify last 4 digits match
      if (card.last4 !== params.last4) {
        throw new Error('Card details do not match');
      }

      // Verify CVV (in production, this would be properly encrypted and verified)
      // For now, we'll accept any 3-4 digit CVV as valid
      if (!/^\d{3,4}$/.test(params.cvv)) {
        throw new Error('Invalid CVV');
      }

      // Verify ZIP code matches billing address
      const billingAddress = card.billing_address as any;
      if (billingAddress?.zip_code !== params.zipCode) {
        throw new Error('ZIP code does not match billing address');
      }

      // Activate the card
      const { data: activatedCard, error: updateError } = await supabase
        .from('cards')
        .update({
          activated_at: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', params.cardId)
        .select()
        .single();

      if (updateError) throw updateError;

      return activatedCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Card activated successfully!', {
        description: 'Your card is now ready to use.',
      });
    },
    onError: (error: Error) => {
      console.error('Activation error:', error);
      toast.error('Activation failed', {
        description: error.message || 'Unable to activate card. Please verify your details.',
      });
    },
  });

  return {
    activateCard: activateCard.mutate,
    isActivating: activateCard.isPending,
  };
}

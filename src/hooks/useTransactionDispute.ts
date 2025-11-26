import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerateLetterParams {
  transactionId: string;
  reason: string;
  details: string;
  merchant: string;
  amount: number;
  date: string;
}

interface SubmitDisputeParams {
  transactionId: string;
  reason: string;
  details: string;
  letter: string | null;
}

export function useTransactionDispute() {
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const generateLetterMutation = useMutation({
    mutationFn: async (params: GenerateLetterParams) => {
      const { data, error } = await supabase.functions.invoke('card-genius', {
        body: {
          mode: 'dispute',
          query: params.reason,
          context: {
            transactionId: params.transactionId,
            merchant: params.merchant,
            amount: params.amount,
            date: params.date,
            additionalDetails: params.details,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.structured?.letter) {
        setGeneratedLetter(data.structured.letter);
      } else if (data?.result) {
        setGeneratedLetter(data.result);
      }
      toast.success('Dispute letter generated successfully');
    },
    onError: (error) => {
      console.error('Error generating letter:', error);
      toast.error('Failed to generate dispute letter');
    },
  });

  const submitDisputeMutation = useMutation({
    mutationFn: async (params: SubmitDisputeParams) => {
      const { data, error } = await supabase
        .from('card_transactions')
        .update({
          dispute_status: 'pending',
          dispute_reason: params.reason,
          dispute_submitted_at: new Date().toISOString(),
        })
        .eq('id', params.transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-transactions'] });
      setGeneratedLetter(null);
      toast.success('Dispute submitted successfully');
    },
    onError: (error) => {
      console.error('Error submitting dispute:', error);
      toast.error('Failed to submit dispute');
    },
  });

  return {
    generateLetter: (params: GenerateLetterParams) => generateLetterMutation.mutate(params),
    submitDispute: (params: SubmitDisputeParams) => submitDisputeMutation.mutate(params),
    isGenerating: generateLetterMutation.isPending,
    isSubmitting: submitDisputeMutation.isPending,
    generatedLetter,
  };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnrichmentResult {
  ai_merchant_name: string;
  ai_category: string;
  ai_confidence: number;
  original_merchant: string;
}

export function useCardTransactionEnrichment() {
  const queryClient = useQueryClient();

  const enrichMutation = useMutation({
    mutationFn: async ({ transactionId, rawMerchant }: { transactionId: string; rawMerchant: string }) => {
      const { data, error } = await supabase.functions.invoke('enrich-card-transaction', {
        body: { transactionId, rawMerchant }
      });

      if (error) throw error;
      return data as EnrichmentResult;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card_transactions'] });
      
      if (data.ai_confidence > 0.8) {
        toast.success('✨ Transaction enriched', {
          description: `${data.ai_merchant_name} • ${data.ai_category}`,
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      console.error('Enrichment error:', error);
      toast.error('Failed to enrich transaction');
    },
  });

  const batchEnrichMutation = useMutation({
    mutationFn: async (transactions: Array<{ id: string; merchant: string }>) => {
      const results = await Promise.allSettled(
        transactions.map(async (tx) => {
          return supabase.functions.invoke('enrich-card-transaction', {
            body: { transactionId: tx.id, rawMerchant: tx.merchant }
          });
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      return { total: transactions.length, successful };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['card_transactions'] });
      toast.success(`✨ Enriched ${data.successful} of ${data.total} transactions`);
    },
  });

  return {
    enrich: enrichMutation.mutate,
    batchEnrich: batchEnrichMutation.mutate,
    isEnriching: enrichMutation.isPending,
    isBatchEnriching: batchEnrichMutation.isPending,
  };
}

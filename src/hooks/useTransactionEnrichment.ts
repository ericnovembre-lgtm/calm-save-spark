import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transactionKeys } from "@/lib/query-keys";

interface EnrichmentResult {
  cleaned_name: string;
  suggested_category: string;
  confidence_score: number;
  original_merchant?: string;
}

export function useTransactionEnrichment() {
  const queryClient = useQueryClient();

  const enrichMutation = useMutation({
    mutationFn: async ({ transactionId, rawMerchant }: { transactionId: string; rawMerchant: string }) => {
      const { data, error } = await supabase.functions.invoke('enrich-transaction', {
        body: { transactionId, rawMerchant }
      });

      if (error) throw error;
      return data as EnrichmentResult;
    },
    onSuccess: (data, variables) => {
      // Invalidate transaction queries to refetch with enriched data
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      
      if (data.confidence_score > 0.8) {
        toast.success('✨ Transaction enriched', {
          description: `${data.cleaned_name} • ${data.suggested_category}`,
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      console.error('Enrichment error:', error);
      toast.error('Failed to enrich transaction', {
        description: 'Please try again later',
      });
    },
  });

  const recategorizeMutation = useMutation({
    mutationFn: async ({ transactionId, category }: { transactionId: string; category: string }) => {
      const { error } = await supabase
        .from('transactions')
        .update({ category })
        .eq('id', transactionId);

      if (error) throw error;
    },
    onMutate: async ({ transactionId, category }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: transactionKeys.all });

      const previousData = queryClient.getQueryData(transactionKeys.all);

      // Update all relevant queries
      queryClient.setQueriesData({ queryKey: transactionKeys.all }, (old: any) => {
        if (!old) return old;
        
        if (old.pages) {
          // Handle infinite query
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              transactions: page.transactions.map((tx: any) =>
                tx.id === transactionId ? { ...tx, category } : tx
              ),
            })),
          };
        }
        
        return old;
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(transactionKeys.all, context.previousData);
      }
      toast.error('Failed to update category');
    },
    onSuccess: () => {
      toast.success('Category updated');
    },
  });

  const batchEnrichMutation = useMutation({
    mutationFn: async (transactionIds: string[]) => {
      const results = await Promise.allSettled(
        transactionIds.map(async (id) => {
          const { data: tx } = await supabase
            .from('transactions')
            .select('id, merchant')
            .eq('id', id)
            .single();

          if (tx?.merchant) {
            return supabase.functions.invoke('enrich-transaction', {
              body: { transactionId: tx.id, rawMerchant: tx.merchant }
            });
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      return { total: transactionIds.length, successful };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      toast.success(`✨ Enriched ${data.successful} of ${data.total} transactions`);
    },
  });

  return {
    enrich: enrichMutation.mutate,
    recategorize: recategorizeMutation.mutate,
    batchEnrich: batchEnrichMutation.mutate,
    isEnriching: enrichMutation.isPending,
    isRecategorizing: recategorizeMutation.isPending,
    isBatchEnriching: batchEnrichMutation.isPending,
  };
}

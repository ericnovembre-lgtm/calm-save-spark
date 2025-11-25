import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReceiptMatchResult {
  matched: boolean;
  transaction?: any;
  candidates?: Array<{
    transaction: any;
    confidence: number;
    matchDetails: {
      merchantMatch: number;
      amountMatch: number;
      dateMatch: number;
    };
  }>;
  extractedData: {
    merchant: string;
    amount: number;
    date: string;
    items?: Array<{ name: string; price: number }>;
  };
}

export function useCardReceiptMatching() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadAndMatchMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload receipt to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Call matching edge function
      const { data, error } = await supabase.functions.invoke('match-card-receipt', {
        body: { imagePath: uploadData.path, userId: user.id }
      });

      if (error) throw error;
      return data as ReceiptMatchResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['card_transactions'] });
      
      if (data.matched) {
        toast.success('Receipt matched!', {
          description: `Linked to ${data.transaction.ai_merchant_name || data.transaction.merchant_name}`,
          duration: 4000,
        });
      } else {
        toast.info('Receipt uploaded', {
          description: `Found ${data.candidates?.length || 0} potential matches`,
          duration: 4000,
        });
      }
    },
    onError: (error) => {
      console.error('Receipt matching error:', error);
      toast.error('Failed to process receipt', {
        description: error.message,
      });
    },
  });

  const linkReceiptManually = useMutation({
    mutationFn: async ({ transactionId, imagePath, extractedData }: {
      transactionId: string;
      imagePath: string;
      extractedData: any;
    }) => {
      const { error } = await supabase
        .from('card_transactions')
        .update({
          receipt_image_path: imagePath,
          receipt_matched_at: new Date().toISOString(),
          receipt_match_confidence: 1.0,
          receipt_extracted_data: extractedData,
          receipt_verified: true
        })
        .eq('id', transactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card_transactions'] });
      toast.success('Receipt linked successfully');
    },
    onError: (error) => {
      toast.error('Failed to link receipt', { description: error.message });
    },
  });

  const verifyReceipt = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('card_transactions')
        .update({ receipt_verified: true })
        .eq('id', transactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card_transactions'] });
      toast.success('Receipt verified');
    },
  });

  return {
    uploadAndMatch: uploadAndMatchMutation.mutate,
    linkManually: linkReceiptManually.mutate,
    verifyReceipt: verifyReceipt.mutate,
    isProcessing: uploadAndMatchMutation.isPending,
    matchResult: uploadAndMatchMutation.data,
    uploadProgress,
  };
}
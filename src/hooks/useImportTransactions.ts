import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TransactionToImport {
  transaction_date: string;
  merchant: string;
  amount: number;
  category: string;
  description?: string;
}

export function useImportTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactions: TransactionToImport[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to import transactions");
      }

      // Prepare transactions with user_id
      const transactionsWithUser = transactions.map(t => ({
        user_id: user.id,
        transaction_date: t.transaction_date,
        merchant: t.merchant,
        amount: t.amount,
        category: t.category,
        description: t.description || null,
        is_recurring: false,
      }));

      // Import in batches of 100
      const batchSize = 100;
      let imported = 0;
      
      for (let i = 0; i < transactionsWithUser.length; i += batchSize) {
        const batch = transactionsWithUser.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from("transactions")
          .insert(batch);

        if (error) {
          console.error("Batch import error:", error);
          throw new Error(`Failed to import batch: ${error.message}`);
        }
        
        imported += batch.length;
      }

      return { imported };
    },
    onSuccess: (data) => {
      toast.success(`Successfully imported ${data.imported} transactions`);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error) => {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import transactions");
    },
  });
}

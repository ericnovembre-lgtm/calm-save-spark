import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SeedResult {
  success: boolean;
  message: string;
  summary?: {
    totalTransactions: number;
    expenseTransactions: number;
    incomeTransactions: number;
    totalExpenses: number;
    totalIncome: number;
    dateRange: string;
  };
}

/**
 * Hook to seed sample transaction data for testing the Analytics Dashboard
 */
export function useSeedSampleData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<SeedResult> => {
      const { data, error } = await supabase.functions.invoke("seed-sample-transactions");

      if (error) {
        throw new Error(error.message || "Failed to seed sample data");
      }

      return data as SeedResult;
    },
    onSuccess: (data) => {
      // Invalidate all analytics-related queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ai-insights"] });
      
      toast.success(data.message, {
        description: data.summary 
          ? `${data.summary.totalTransactions} transactions over ${data.summary.dateRange}` 
          : undefined,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to generate sample data", {
        description: error.message,
      });
    },
  });
}

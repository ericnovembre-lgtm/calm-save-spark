import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface CategoryFeedback {
  id: string;
  user_id: string;
  suggestion_id: string | null;
  merchant_name: string;
  suggested_category: string;
  accepted_category: string | null;
  feedback_type: "accepted" | "corrected" | "rejected";
  confidence_before: number | null;
  created_at: string;
}

export interface SubmitFeedbackParams {
  merchantName: string;
  suggestedCategory: string;
  acceptedCategory?: string;
  feedbackType: "accepted" | "corrected" | "rejected";
  confidenceBefore?: number;
  suggestionId?: string;
}

export const useCategoryFeedback = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's feedback history
  const feedbackQuery = useQuery({
    queryKey: ["category-feedback", user?.id],
    queryFn: async (): Promise<CategoryFeedback[]> => {
      if (!user) return [];

      const { data, error } = await (supabase
        .from("category_feedback" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100) as any);

      if (error) throw error;
      return (data || []) as CategoryFeedback[];
    },
    enabled: !!user,
  });

  // Fetch learning stats for a merchant
  const useMerchantLearning = (merchantName: string) => {
    return useQuery({
      queryKey: ["merchant-learning", merchantName],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("category_feedback" as any)
          .select("suggested_category, accepted_category, feedback_type")
          .ilike("merchant_name", `%${merchantName}%`)
          .limit(50);

        if (error) return { learned: false, preferredCategory: null, confidence: 0 };

        const corrections = (data || []).filter(
          (f: any) => f.feedback_type === "corrected" && f.accepted_category
        );
        
        if (corrections.length === 0) {
          return { learned: false, preferredCategory: null, confidence: 0 };
        }

        // Find most common accepted category
        const categoryCounts: Record<string, number> = {};
        corrections.forEach((c: any) => {
          categoryCounts[c.accepted_category] = (categoryCounts[c.accepted_category] || 0) + 1;
        });

        const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCategories[0];

        return {
          learned: true,
          preferredCategory: topCategory[0],
          confidence: topCategory[1] / corrections.length,
          totalCorrections: corrections.length,
        };
      },
      enabled: !!merchantName,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (params: SubmitFeedbackParams) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase
        .from("category_feedback" as any)
        .insert({
          user_id: user.id,
          suggestion_id: params.suggestionId || null,
          merchant_name: params.merchantName,
          suggested_category: params.suggestedCategory,
          accepted_category: params.acceptedCategory || null,
          feedback_type: params.feedbackType,
          confidence_before: params.confidenceBefore || null,
        })
        .select()
        .single() as any);

      if (error) throw error;

      // Trigger ML learning edge function
      await supabase.functions.invoke("ml-category-learn", {
        body: {
          feedbackId: (data as any).id,
          merchantName: params.merchantName,
          suggestedCategory: params.suggestedCategory,
          acceptedCategory: params.acceptedCategory,
          feedbackType: params.feedbackType,
        },
      }).catch(console.warn);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-feedback"] });
    },
    onError: (error) => {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to save category feedback");
    },
  });

  // Get learning progress stats
  const learningStats = useQuery({
    queryKey: ["category-learning-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("category_feedback" as any)
        .select("feedback_type")
        .eq("user_id", user.id);

      if (error) return null;

      const stats = {
        total: data?.length || 0,
        accepted: data?.filter((f: any) => f.feedback_type === "accepted").length || 0,
        corrected: data?.filter((f: any) => f.feedback_type === "corrected").length || 0,
        rejected: data?.filter((f: any) => f.feedback_type === "rejected").length || 0,
      };

      return {
        ...stats,
        accuracy: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
      };
    },
    enabled: !!user,
  });

  return {
    feedback: feedbackQuery.data || [],
    isLoading: feedbackQuery.isLoading,
    submitFeedback,
    useMerchantLearning,
    learningStats: learningStats.data,
  };
};

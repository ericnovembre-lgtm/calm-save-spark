import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreditGoal {
  id: string;
  user_id: string;
  target_score: number;
  reason: string | null;
  target_date: string | null;
  starting_score: number;
  created_at: string;
  updated_at: string;
  is_achieved: boolean;
  achieved_at: string | null;
}

export function useCreditGoal() {
  const queryClient = useQueryClient();

  const { data: currentGoal, isLoading } = useQuery({
    queryKey: ["credit-goal"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("credit_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_achieved", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as CreditGoal | null;
    },
  });

  const createGoal = useMutation({
    mutationFn: async (goal: {
      target_score: number;
      reason?: string;
      target_date?: string;
      starting_score: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("credit_goals")
        .insert({
          user_id: user.id,
          ...goal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-goal"] });
      toast.success("Credit goal created!");
    },
    onError: (error) => {
      console.error("Error creating credit goal:", error);
      toast.error("Failed to create credit goal");
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({
      goalId,
      updates,
    }: {
      goalId: string;
      updates: Partial<CreditGoal>;
    }) => {
      const { data, error } = await supabase
        .from("credit_goals")
        .update(updates)
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-goal"] });
      toast.success("Credit goal updated!");
    },
    onError: (error) => {
      console.error("Error updating credit goal:", error);
      toast.error("Failed to update credit goal");
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from("credit_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-goal"] });
      toast.success("Credit goal deleted");
    },
    onError: (error) => {
      console.error("Error deleting credit goal:", error);
      toast.error("Failed to delete credit goal");
    },
  });

  const achieveGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { data, error } = await supabase
        .from("credit_goals")
        .update({
          is_achieved: true,
          achieved_at: new Date().toISOString(),
        })
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-goal"] });
      toast.success("🎉 Credit goal achieved! Congratulations!");
    },
  });

  return {
    currentGoal,
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    achieveGoal: achieveGoal.mutate,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
  };
}

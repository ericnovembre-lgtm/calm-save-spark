import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if user has edit permission for a budget
 */
export const useBudgetPermission = (budgetId: string | undefined) => {
  return useQuery({
    queryKey: ["budget-permission", budgetId],
    queryFn: async () => {
      if (!budgetId) return { canEdit: false, canAdmin: false, isOwner: false };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { canEdit: false, canAdmin: false, isOwner: false };

      // Check if user is owner
      const { data: budget } = await supabase
        .from("user_budgets")
        .select("user_id")
        .eq("id", budgetId)
        .single();

      if (budget?.user_id === session.user.id) {
        return { canEdit: true, canAdmin: true, isOwner: true };
      }

      // Check if user has shared access
      const { data: share } = await supabase
        .from("budget_shares")
        .select("permission_level")
        .eq("budget_id", budgetId)
        .eq("shared_with_user_id", session.user.id)
        .eq("status", "accepted")
        .single();

      if (!share) {
        return { canEdit: false, canAdmin: false, isOwner: false };
      }

      return {
        canEdit: ["edit", "admin"].includes(share.permission_level),
        canAdmin: share.permission_level === "admin",
        isOwner: false,
      };
    },
    enabled: !!budgetId,
  });
};

/**
 * Hook to get all budgets user has access to (owned + shared)
 */
export const useSharedBudgets = () => {
  return useQuery({
    queryKey: ["shared-budgets"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      // Get owned budgets
      const { data: ownedBudgets, error: ownedError } = await supabase
        .from("user_budgets")
        .select("*")
        .eq("user_id", session.user.id);

      if (ownedError) throw ownedError;

      // Get shared budgets
      const { data: sharedBudgets, error: sharedError } = await supabase
        .from("budget_shares")
        .select(`
          *,
          budget:budget_id (
            *
          )
        `)
        .eq("shared_with_user_id", session.user.id)
        .eq("status", "accepted");

      if (sharedError) throw sharedError;

      // Combine and mark source
      const owned = (ownedBudgets || []).map((b) => ({
        ...b,
        isShared: false,
        permission: "admin" as const,
      }));

      const shared = (sharedBudgets || [])
        .filter((s) => s.budget)
        .map((s) => ({
          ...(s.budget as any),
          isShared: true,
          permission: s.permission_level,
        }));

      return [...owned, ...shared];
    },
  });
};

/**
 * Hook to get pending budget share invitations
 */
export const usePendingInvitations = () => {
  return useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("budget_shares")
        .select(`
          *,
          budget:budget_id (
            name,
            total_limit
          ),
          inviter:invited_by (
            full_name
          )
        `)
        .eq("shared_with_user_id", session.user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

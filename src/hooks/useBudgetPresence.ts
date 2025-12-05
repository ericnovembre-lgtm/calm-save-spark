import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BudgetPresence {
  id: string;
  budget_id: string;
  user_id: string;
  last_seen_at: string;
  cursor_position: {
    categoryId?: string;
    action?: string;
  } | null;
  // Joined data
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const STALE_THRESHOLD = 60000; // 60 seconds - consider user offline after this

/**
 * Hook to manage budget presence (who's viewing) with realtime updates
 */
export const useBudgetPresence = (budgetId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch presence for a budget using raw query (table not in generated types yet)
  const presenceQuery = useQuery({
    queryKey: ["budget-presence", budgetId],
    queryFn: async (): Promise<BudgetPresence[]> => {
      if (!budgetId) return [];

      const staleThreshold = new Date(Date.now() - STALE_THRESHOLD).toISOString();

      try {
        // Direct query with type assertion since budget_presence isn't in generated types
        const { data, error } = await (supabase
          .from("budget_presence" as any)
          .select(`
            *,
            user:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq("budget_id", budgetId)
          .gte("last_seen_at", staleThreshold) as any);

        if (error) {
          console.warn("Budget presence query failed:", error);
          return [];
        }
        return (data || []) as BudgetPresence[];
      } catch (err) {
        console.warn("Budget presence error:", err);
        return [];
      }
    },
    enabled: !!budgetId,
    refetchInterval: HEARTBEAT_INTERVAL,
  });

  // Update presence (heartbeat)
  const updatePresenceMutation = useMutation({
    mutationFn: async (cursorPosition?: { categoryId?: string; action?: string }) => {
      if (!budgetId || !user) return;

      const { error } = await supabase
        .from("budget_presence" as any)
        .upsert(
          {
            budget_id: budgetId,
            user_id: user.id,
            last_seen_at: new Date().toISOString(),
            cursor_position: cursorPosition || null,
          },
          {
            onConflict: "budget_id,user_id",
          }
        );

      if (error) {
        console.warn("Failed to update presence:", error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-presence", budgetId] });
    },
  });

  // Remove presence on leave
  const removePresenceMutation = useMutation({
    mutationFn: async () => {
      if (!budgetId || !user) return;

      const { error } = await supabase
        .from("budget_presence" as any)
        .delete()
        .eq("budget_id", budgetId)
        .eq("user_id", user.id);

      if (error) {
        console.warn("Failed to remove presence:", error);
      }
    },
  });

  // Update cursor position
  const updateCursor = useCallback(
    (categoryId?: string, action?: string) => {
      updatePresenceMutation.mutate({ categoryId, action });
    },
    [updatePresenceMutation]
  );

  // Start heartbeat when component mounts
  useEffect(() => {
    if (!budgetId || !user) return;

    // Initial presence update
    updatePresenceMutation.mutate(undefined);

    // Set up heartbeat interval
    heartbeatRef.current = setInterval(() => {
      updatePresenceMutation.mutate(undefined);
    }, HEARTBEAT_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      removePresenceMutation.mutate(undefined);
    };
  }, [budgetId, user?.id]);

  // Handle visibility change (pause heartbeat when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }
      } else {
        // Resume heartbeat when visible again
        updatePresenceMutation.mutate(undefined);
        heartbeatRef.current = setInterval(() => {
          updatePresenceMutation.mutate(undefined);
        }, HEARTBEAT_INTERVAL);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Realtime subscription for presence changes
  useEffect(() => {
    if (!budgetId) return;

    const channel = supabase
      .channel(`budget-presence-${budgetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "budget_presence",
          filter: `budget_id=eq.${budgetId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["budget-presence", budgetId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [budgetId, queryClient]);

  // Filter out current user from viewers list
  const otherViewers = (presenceQuery.data || []).filter(
    (p) => p.user_id !== user?.id
  );

  return {
    viewers: otherViewers,
    allPresence: presenceQuery.data || [],
    isLoading: presenceQuery.isLoading,
    updateCursor,
    currentUserId: user?.id,
  };
};

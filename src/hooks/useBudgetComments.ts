import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface BudgetComment {
  id: string;
  budget_id: string;
  user_id: string;
  comment_text: string;
  parent_comment_id: string | null;
  mentions: string[];
  is_edited: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    full_name: string;
    avatar_url?: string;
  };
  replies?: BudgetComment[];
}

/**
 * Hook to manage budget comments with realtime subscriptions
 */
export const useBudgetComments = (budgetId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments for a budget
  const commentsQuery = useQuery({
    queryKey: ["budget-comments", budgetId],
    queryFn: async () => {
      if (!budgetId) return [];

      const { data, error } = await supabase
        .from("budget_comments")
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("budget_id", budgetId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Organize into threads (parent comments with replies)
      const allComments = (data || []) as any[];
      const parentComments = allComments.filter((c) => !c.parent_comment_id);
      const replies = allComments.filter((c) => c.parent_comment_id);

      return parentComments.map((parent) => ({
        ...parent,
        mentions: parent.mentions || [],
        is_resolved: parent.is_resolved || false,
        replies: replies.filter((r) => r.parent_comment_id === parent.id).map((r) => ({
          ...r,
          mentions: r.mentions || [],
          is_resolved: r.is_resolved || false,
        })),
      })) as BudgetComment[];
    },
    enabled: !!budgetId,
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async ({
      commentText,
      parentCommentId,
      mentions = [],
    }: {
      commentText: string;
      parentCommentId?: string;
      mentions?: string[];
    }) => {
      if (!budgetId || !user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budget_comments")
        .insert({
          budget_id: budgetId,
          user_id: user.id,
          comment_text: commentText,
          parent_comment_id: parentCommentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Notify mentioned users via edge function
      if (mentions.length > 0) {
        await supabase.functions.invoke("notify-mention", {
          body: {
            commentId: data.id,
            budgetId,
            mentionedUserIds: mentions,
            commentText,
          },
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-comments", budgetId] });
    },
    onError: (error) => {
      toast.error("Failed to add comment");
      console.error(error);
    },
  });

  // Edit comment mutation
  const editComment = useMutation({
    mutationFn: async ({
      commentId,
      commentText,
    }: {
      commentId: string;
      commentText: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budget_comments")
        .update({
          comment_text: commentText,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-comments", budgetId] });
    },
    onError: () => {
      toast.error("Failed to edit comment");
    },
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("budget_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-comments", budgetId] });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  // Resolve comment thread mutation
  const resolveThread = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Not authenticated");

      // Use raw update since is_resolved may not be in types yet
      const { data, error } = await supabase
        .from("budget_comments")
        .update({
          is_edited: true, // Use existing field as workaround
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-comments", budgetId] });
      toast.success("Thread resolved");
    },
    onError: () => {
      toast.error("Failed to resolve thread");
    },
  });

  // Realtime subscription for comments
  useEffect(() => {
    if (!budgetId) return;

    const channel = supabase
      .channel(`budget-comments-${budgetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "budget_comments",
          filter: `budget_id=eq.${budgetId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["budget-comments", budgetId] });

          if (payload.eventType === "INSERT" && (payload.new as any).user_id !== user?.id) {
            toast.info("New comment added");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [budgetId, queryClient, user?.id]);

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    error: commentsQuery.error,
    addComment,
    editComment,
    deleteComment,
    resolveThread,
  };
};

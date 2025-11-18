import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface BudgetCommentsProps {
  budgetId: string;
}

export const BudgetComments = ({ budgetId }: BudgetCommentsProps) => {
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();

  const { data: comments, isLoading, refetch } = useQuery({
    queryKey: ["budget-comments", budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_comments")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("budget_id", budgetId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
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
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [budgetId, refetch]);

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("budget_comments").insert({
        budget_id: budgetId,
        user_id: session.user.id,
        comment_text: text,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["budget-comments", budgetId] });
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("budget_comments")
        .delete()
        .eq("id", commentId);

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

  const handleSubmit = () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    addCommentMutation.mutate(commentText);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Comments</h3>
      </div>

      {/* Add Comment */}
      <div className="mb-4 space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button
          onClick={handleSubmit}
          disabled={addCommentMutation.isPending || !commentText.trim()}
          size="sm"
        >
          {addCommentMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Post comment
            </>
          )}
        </Button>
      </div>

      {/* Comments List */}
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {comment.profiles?.full_name?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {comment.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                        {comment.is_edited && " (edited)"}
                      </p>
                    </div>
                    {comment.user_id === (async () => {
                      const { data: { session } } = await supabase.auth.getSession();
                      return session?.user.id;
                    })() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground">Be the first to add one!</p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

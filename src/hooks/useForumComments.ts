import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  replies?: ForumComment[];
}

export function useForumComments(postId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['forum-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Build threaded structure
      const commentMap = new Map<string, ForumComment>();
      const rootComments: ForumComment[] = [];

      (data as ForumComment[]).forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      commentMap.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      return rootComments;
    },
    enabled: !!postId,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`forum-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const createComment = useMutation({
    mutationFn: async ({ content, parentCommentId }: { content: string; parentCommentId?: string }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          user_id: session.user.id,
          content,
          parent_comment_id: parentCommentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
    onError: () => {
      toast.error('Failed to post comment');
    },
  });

  const likeComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('forum_post_likes')
        .insert({
          comment_id: commentId,
          user_id: session.user.id,
        });

      if (error) {
        if (error.code === '23505') {
          await supabase
            .from('forum_post_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', session.user.id);
        } else {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
      toast.success('Comment deleted');
    },
  });

  return {
    comments: comments || [],
    isLoading,
    error,
    createComment,
    likeComment,
    deleteComment,
  };
}

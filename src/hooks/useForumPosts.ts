import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ForumPost {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface CreatePostInput {
  category_id?: string;
  title: string;
  content: string;
}

export function useForumPosts(categorySlug?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['forum-posts', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories!inner(slug)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (categorySlug) {
        query = query.eq('forum_categories.slug', categorySlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ForumPost[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (input: CreatePostInput) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          user_id: session.user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Post created');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('forum_post_likes')
        .insert({
          post_id: postId,
          user_id: session.user.id,
        });

      if (error) {
        if (error.code === '23505') {
          // Already liked, remove like
          await supabase
            .from('forum_post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', session.user.id);
        } else {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Post deleted');
    },
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    createPost,
    likePost,
    deletePost,
  };
}

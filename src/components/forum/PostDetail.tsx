import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Flag, MoreHorizontal } from 'lucide-react';
import { ForumPost, useForumPosts } from '@/hooks/useForumPosts';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { CommentThread } from './CommentThread';
import { CommentEditor } from './CommentEditor';
import { useAuth } from '@/contexts/AuthContext';

interface PostDetailProps {
  post: ForumPost;
  onBack: () => void;
}

export function PostDetail({ post, onBack }: PostDetailProps) {
  const { session } = useAuth();
  const { likePost } = useForumPosts();

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to discussions
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-card border border-border"
      >
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback>
              {post.author?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{post.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{post.author?.full_name || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likePost.mutate(post.id)}
              >
                <Heart className="w-4 h-4 mr-2" />
                {post.like_count}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Comments</h3>
        
        {session && !post.is_locked && (
          <CommentEditor postId={post.id} />
        )}

        <CommentThread postId={post.id} />
      </div>
    </div>
  );
}

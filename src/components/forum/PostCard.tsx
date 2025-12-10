import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye, Pin, Lock } from 'lucide-react';
import { ForumPost } from '@/hooks/useForumPosts';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostCardProps {
  post: ForumPost;
  index: number;
  onClick: () => void;
}

export function PostCard({ post, index, onClick }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author?.avatar_url || undefined} />
          <AvatarFallback>
            {post.author?.full_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {post.is_pinned && (
              <Pin className="w-4 h-4 text-amber-500" />
            )}
            {post.is_locked && (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
            <h3 className="font-medium line-clamp-1">{post.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {post.content}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>{post.author?.full_name || 'Anonymous'}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>{post.like_count}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{post.view_count}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

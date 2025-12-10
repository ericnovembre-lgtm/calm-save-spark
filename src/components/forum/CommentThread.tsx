import { motion } from 'framer-motion';
import { Heart, Reply, Trash2 } from 'lucide-react';
import { useForumComments, ForumComment } from '@/hooks/useForumComments';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { CommentEditor } from './CommentEditor';

interface CommentThreadProps {
  postId: string;
}

export function CommentThread({ postId }: CommentThreadProps) {
  const { comments, isLoading } = useForumComments(postId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <CommentItem key={comment.id} comment={comment} index={index} postId={postId} />
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: ForumComment;
  index: number;
  postId: string;
  depth?: number;
}

function CommentItem({ comment, index, postId, depth = 0 }: CommentItemProps) {
  const { session } = useAuth();
  const { likeComment, deleteComment } = useForumComments(postId);
  const [showReply, setShowReply] = useState(false);

  const isOwner = session?.user?.id === comment.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-3"
      style={{ marginLeft: depth > 0 ? `${depth * 24}px` : 0 }}
    >
      <div className="p-4 rounded-lg bg-muted/50">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">User</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => likeComment.mutate(comment.id)}
              >
                <Heart className="w-3 h-3 mr-1" />
                {comment.like_count}
              </Button>
              
              {session && depth < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowReply(!showReply)}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => deleteComment.mutate(comment.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReply && (
        <div className="ml-8">
          <CommentEditor
            postId={postId}
            parentCommentId={comment.id}
            onSuccess={() => setShowReply(false)}
            compact
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply, replyIndex) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              index={replyIndex}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

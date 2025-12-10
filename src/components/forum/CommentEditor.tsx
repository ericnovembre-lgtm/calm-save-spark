import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForumComments } from '@/hooks/useForumComments';

interface CommentEditorProps {
  postId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export function CommentEditor({ postId, parentCommentId, onSuccess, compact }: CommentEditorProps) {
  const [content, setContent] = useState('');
  const { createComment } = useForumComments(postId);

  const handleSubmit = () => {
    if (!content.trim()) return;

    createComment.mutate(
      { content: content.trim(), parentCommentId },
      {
        onSuccess: () => {
          setContent('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className={`flex gap-2 ${compact ? '' : 'p-4 rounded-lg bg-muted/30'}`}>
      <Textarea
        placeholder={parentCommentId ? 'Write a reply...' : 'Add a comment...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={compact ? 2 : 3}
        className="flex-1 resize-none"
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!content.trim() || createComment.isPending}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}

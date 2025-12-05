import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  Reply, 
  MoreHorizontal, 
  Check, 
  Trash2, 
  Edit2,
  AtSign,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBudgetComments, BudgetComment } from "@/hooks/useBudgetComments";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface BudgetCommentThreadProps {
  budgetId: string;
  collaborators?: Array<{ id: string; full_name: string; avatar_url?: string }>;
  className?: string;
}

export const BudgetCommentThread: React.FC<BudgetCommentThreadProps> = ({
  budgetId,
  collaborators = [],
  className,
}) => {
  const { user } = useAuth();
  const { comments, isLoading, addComment, editComment, deleteComment, resolveThread } =
    useBudgetComments(budgetId);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new comments
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  // Parse @mentions from text
  const parseMentions = (text: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[2]); // User ID
    }
    return mentions;
  };

  // Handle mention insertion
  const handleMentionSelect = (collaborator: { id: string; full_name: string }) => {
    const mentionText = `@[${collaborator.full_name}](${collaborator.id}) `;
    setNewComment((prev) => prev.replace(/@\w*$/, mentionText));
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // Handle text change with mention detection
  const handleTextChange = (text: string) => {
    setNewComment(text);
    
    // Check for @ trigger
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = text.slice(lastAtIndex + 1);
      if (!afterAt.includes(" ") && !afterAt.includes("[")) {
        setShowMentions(true);
        setMentionSearch(afterAt.toLowerCase());
        return;
      }
    }
    setShowMentions(false);
  };

  // Submit comment
  const handleSubmit = async (parentId?: string) => {
    const text = parentId ? editText : newComment;
    if (!text.trim()) return;

    const mentions = parseMentions(text);

    if (editingId) {
      await editComment.mutateAsync({ commentId: editingId, commentText: text });
      setEditingId(null);
      setEditText("");
    } else {
      await addComment.mutateAsync({
        commentText: text,
        parentCommentId: parentId || replyingTo || undefined,
        mentions,
      });
      setNewComment("");
      setReplyingTo(null);
    }
  };

  // Filter collaborators for mention dropdown
  const filteredCollaborators = collaborators.filter((c) =>
    c.full_name.toLowerCase().includes(mentionSearch)
  );

  const renderComment = (comment: BudgetComment, isReply = false) => {
    const isOwn = comment.user_id === user?.id;
    const initials = comment.user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "group flex gap-3",
          isReply && "ml-10 mt-2",
          comment.is_resolved && "opacity-60"
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.user?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">
              {comment.user?.full_name || "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {comment.is_resolved && (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            )}
          </div>

          {editingId === comment.id ? (
            <div className="mt-1 flex gap-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={() => handleSubmit()}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">
              {comment.comment_text.replace(
                /@\[([^\]]+)\]\([^)]+\)/g,
                (_, name) => `@${name}`
              )}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isReply && !comment.is_resolved && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.comment_text);
                    }}
                  >
                    <Edit2 className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteComment.mutate(comment.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  {!isReply && !comment.is_resolved && (
                    <DropdownMenuItem onClick={() => resolveThread.mutate(comment.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      Resolve
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}

          {/* Reply input */}
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 flex gap-2"
            >
              <Textarea
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSubmit(comment.id)}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment("");
                  }}
                >
                  ✕
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Comments</span>
        <span className="text-xs text-muted-foreground">({comments.length})</span>
      </div>

      {/* Comments list */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No comments yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {comments.map((comment) => renderComment(comment))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* New comment input */}
      <div className="p-3 border-t border-border relative">
        {/* Mention dropdown */}
        <AnimatePresence>
          {showMentions && filteredCollaborators.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-3 right-3 mb-1 bg-popover border border-border rounded-md shadow-lg max-h-32 overflow-y-auto"
            >
              {filteredCollaborators.map((c) => (
                <button
                  key={c.id}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-left text-sm"
                  onClick={() => handleMentionSelect(c)}
                >
                  <AtSign className="h-3 w-3 text-muted-foreground" />
                  {c.full_name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment... Use @ to mention"
            value={newComment}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => handleSubmit()}
            disabled={!newComment.trim() || addComment.isPending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Press ⌘+Enter to send
        </p>
      </div>
    </div>
  );
};

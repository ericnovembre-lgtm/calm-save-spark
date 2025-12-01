import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ChatHistoryPanelProps {
  userId: string;
  currentConversationId: string | undefined;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (conversationId: string) => void;
}

export function ChatHistoryPanel({
  userId,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: ChatHistoryPanelProps) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['coach-conversations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('agent_type', 'financial_coach')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      toast.success("Conversation deleted");
      onDeleteConversation(conversationId);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-mono"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
        {isLoading ? (
          <div className="text-center text-white/40 py-8 text-sm font-mono">
            Loading conversations...
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv, index) => {
              const isActive = conv.id === currentConversationId;
              const messageCount = Array.isArray(conv.conversation_history) 
                ? conv.conversation_history.length 
                : 0;

              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all group ${
                    isActive
                      ? "bg-command-violet/20 border-command-violet/50"
                      : "bg-slate-950/50 border-white/10 hover:border-command-cyan/30 hover:bg-slate-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3 h-3 text-command-cyan flex-shrink-0" />
                        <span className="text-xs font-mono text-white/60 truncate">
                          {conv.title || "Untitled Chat"}
                        </span>
                      </div>
                      <div className="text-xs text-white/40 font-mono">
                        {messageCount} messages
                      </div>
                      {conv.last_message_at && (
                        <div className="text-xs text-white/30 font-mono mt-1">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-white/40 py-8 text-sm font-mono">
            No conversations yet
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

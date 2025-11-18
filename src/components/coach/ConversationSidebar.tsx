import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation
}: ConversationSidebarProps) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['coach-conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_type', 'financial_coach')
        .order('last_message_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="w-80 border-r border-border flex flex-col bg-muted/30">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Conversations</h2>
        </div>
        <Button
          onClick={onNewConversation}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label="Start new conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading conversations...
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="p-2 space-y-1">
            {conversations.map((convo) => (
              <motion.button
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors border-l-4 ${
                  activeConversationId === convo.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-transparent hover:bg-accent'
                }`}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="font-medium text-sm text-foreground truncate">
                  {convo.title || `Chat ${convo.message_count || 0} messages`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {convo.last_message_at
                    ? format(new Date(convo.last_message_at), 'MMM d, h:mm a')
                    : 'New conversation'}
                </p>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <Button
              onClick={onNewConversation}
              size="sm"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start First Chat
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

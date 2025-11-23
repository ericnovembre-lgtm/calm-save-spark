import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Send, Loader2, MessageSquare, DollarSign, TrendingUp, PiggyBank } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { label: "💰 Vacation affordability", prompt: "Can I afford a $2,000 vacation?" },
  { label: "📊 Debt analysis", prompt: "What's my cash-to-debt ratio?" },
  { label: "💡 Savings advice", prompt: "Should I save more money?" },
  { label: "🔄 Transfer suggestion", prompt: "Should I move money between my accounts?" },
];

export const AICFOAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI CFO. I have access to your real-time account balances, liquidity metrics, and spending patterns. Ask me anything about affordability, transfers, or optimizing your cash flow."
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-cfo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message,
            sessionId
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        throw new Error('Chat failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      setSessionId(data.sessionId);
    },
  });

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    chatMutation.mutate(userMessage);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    chatMutation.mutate(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full p-4 shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          boxShadow: [
            "0 10px 30px rgba(139, 92, 246, 0.3)",
            "0 10px 50px rgba(139, 92, 246, 0.5)",
            "0 10px 30px rgba(139, 92, 246, 0.3)",
          ]
        }}
        transition={{ 
          boxShadow: { duration: 2, repeat: Infinity },
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[600px] p-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-violet-500/10">
                <Brain className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI CFO Assistant</h3>
                <p className="text-xs text-muted-foreground">Ask about affordability, liquidity, transfers</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="p-2 rounded-full bg-violet-500/10 h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-violet-500" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-violet-500 text-white'
                          : 'bg-accent/50 text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="p-2 rounded-full bg-accent/50 h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {chatMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="p-2 rounded-full bg-violet-500/10 h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="bg-accent/50 rounded-2xl px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={chatMutation.isPending}
                className="flex-shrink-0 text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your AI CFO anything..."
                className="min-h-[60px] resize-none"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0 bg-violet-500 hover:bg-violet-600"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

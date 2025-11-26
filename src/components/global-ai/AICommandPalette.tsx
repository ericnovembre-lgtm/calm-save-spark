import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Mic, 
  Send, 
  X,
  Sparkles,
  User,
  Bot
} from 'lucide-react';
import { useGlobalAI } from '@/contexts/GlobalAIContext';
import { SmartStarters } from './SmartStarters';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AICommandPalette() {
  const { isOpen, closeAI, messages, addMessage, pageContext, isVoiceMode, setVoiceMode } = useGlobalAI();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsStreaming(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: {
          message: userMessage,
          agentType: 'general',
          context: pageContext,
        },
      });

      if (error) throw error;
      
      // Handle streaming response
      const response = data.response || data.message || 'I apologize, but I encountered an issue processing your request.';
      addMessage('assistant', response);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeAI}>
      <DialogContent className="max-w-2xl h-[600px] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                {pageContext ? `On ${pageContext.title}` : 'Ready to help'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={closeAI}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try one of these suggestions or ask me anything
                </p>
              </div>
              <SmartStarters />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 mb-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button
              variant={isVoiceMode ? 'default' : 'outline'}
              size="icon"
              onClick={() => setVoiceMode(!isVoiceMode)}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isStreaming}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isStreaming}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

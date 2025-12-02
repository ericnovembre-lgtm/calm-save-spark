import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useDigitalTwinChat } from '@/hooks/useDigitalTwinChat';
import { ModelIndicatorBadge } from '@/components/coach/ModelIndicatorBadge';
import { cn } from '@/lib/utils';

interface TwinChatPanelProps {
  className?: string;
}

export function TwinChatPanel({ className }: TwinChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isStreaming, currentModel, sendMessage, clearChat } = useDigitalTwinChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "What if I lose my job next year?",
    "How does buying a home affect my timeline?",
    "What's my probability of early retirement?",
    "Compare aggressive vs conservative saving",
  ];

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn("fixed bottom-8 right-8 z-50", className)}
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 border-0"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={cn(
              "fixed right-8 bottom-8 z-50 w-[420px] h-[600px]",
              className
            )}
          >
            <Card className="h-full flex flex-col backdrop-blur-xl bg-slate-950/95 border-white/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-semibold text-white">Digital Twin Advisor</h3>
                </div>
                <div className="flex items-center gap-2">
                  {currentModel && (
                    <ModelIndicatorBadge
                      model={currentModel.includes('claude') ? 'claude-sonnet' : 'gemini-flash'}
                      modelName={currentModel}
                      queryType="scenario_analysis"
                      isLoading={isStreaming}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-white/40 text-sm mt-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-cyan-500/40" />
                    <p className="mb-4">Ask me anything about your financial future</p>
                    <div className="space-y-2">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(prompt)}
                          className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60 hover:text-white"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-white'
                          : 'bg-white/5 border border-white/10 text-white/90'
                      )}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.model && (
                        <div className="text-[10px] text-white/40 mt-1">
                          via {msg.model}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isStreaming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your financial future..."
                    disabled={isStreaming}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isStreaming || !input.trim()}
                    size="icon"
                    className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-xs text-white/40 hover:text-white/60 mt-2"
                  >
                    Clear chat
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

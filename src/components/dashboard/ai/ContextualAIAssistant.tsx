import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bot, MessageSquare, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export function ContextualAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState<'happy' | 'thoughtful' | 'excited'>('happy');
  const [suggestion, setSuggestion] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Context-aware suggestions based on scroll position
    const interval = setInterval(() => {
      const suggestions = [
        "I notice you're viewing your balance frequently. Would you like to set up automatic transfers?",
        "Your savings velocity is great this month! Consider increasing your goal by 10%.",
        "Based on your spending patterns, you could save an extra $50 this month.",
        "You're on track to hit your goal 2 weeks early! 🎉",
      ];
      setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
      setExpression(['happy', 'thoughtful', 'excited'][Math.floor(Math.random() * 3)] as any);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Floating Avatar */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-br from-primary to-accent shadow-lg",
          "flex items-center justify-center cursor-pointer",
          "hover:shadow-xl transition-shadow"
        )}
      >
        <Bot className="w-7 h-7 text-primary-foreground" />
        
        {/* Expression indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4"
          animate={{
            scale: expression === 'excited' ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: expression === 'excited' ? Infinity : 0 }}
        >
          {expression === 'excited' && <Sparkles className="w-4 h-4 text-yellow-400" />}
          {expression === 'thoughtful' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
          {expression === 'happy' && <div className="w-2 h-2 rounded-full bg-green-400" />}
        </motion.div>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-44 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">$ave+ Assistant</h3>
                    <p className="text-xs text-muted-foreground">Always here to help</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                {/* Current suggestion */}
                <motion.div
                  key={suggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 rounded-xl p-3 border border-primary/20"
                >
                  <div className="flex gap-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                </motion.div>

                {/* Message history */}
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "rounded-xl p-3",
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-8' 
                        : 'bg-muted mr-8'
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
                <div className="text-xs text-muted-foreground mb-2">Quick actions:</div>
                <div className="flex flex-wrap gap-2">
                  {['Transfer $100', 'Create Goal', 'View Analytics'].map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => setMessages([...messages, { role: 'user', content: action }])}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

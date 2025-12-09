import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentRenderer } from '@/components/generative-ui/ComponentRenderer';
import { ComponentMessage } from '@/components/generative-ui/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BudgetIntent {
  amount: number;
  category: string;
  timeframe: 'monthly' | 'weekly' | 'yearly';
  isRecurring: boolean;
  notes?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  components?: ComponentMessage[];
  timestamp: Date;
  budgetIntent?: BudgetIntent;
  awaitingConfirmation?: boolean;
}

interface ConversationalBudgetPanelProps {
  className?: string;
}

export function ConversationalBudgetPanel({ className }: ConversationalBudgetPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Budget Assistant. Ask me anything about your spending, budgets, or savings goals. Try saying 'Create a $500 budget for Tokyo trip'!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [pendingBudgetIntent, setPendingBudgetIntent] = useState<BudgetIntent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/budget-orchestrator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            conversationId
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      let components: ComponentMessage[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'text') {
              assistantContent += parsed.content;
              
              // Update message in real-time
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 
                      ? { ...m, content: assistantContent }
                      : m
                  );
                }
                return [...prev, {
                  role: 'assistant',
                  content: assistantContent,
                  components: [],
                  timestamp: new Date()
                }];
              });
            }

            if (parsed.type === 'component') {
              const component: ComponentMessage = {
                type: parsed.componentType,
                props: parsed.props
              };
              components.push(component);

              // Add component to latest message
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 
                      ? { ...m, components: [...(m.components || []), component] }
                      : m
                  );
                }
                return prev;
              });
            }

            // Check for budget intent extraction
            if (parsed.type === 'budget_intent') {
              const intent = parsed.intent as BudgetIntent;
              setPendingBudgetIntent(intent);
              
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 
                      ? { ...m, budgetIntent: intent, awaitingConfirmation: true }
                      : m
                  );
                }
                return prev;
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetConfirm = async (intent: BudgetIntent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get or create category
      const { data: category } = await supabase
        .from('budget_categories')
        .select('code')
        .ilike('name', intent.category)
        .limit(1)
        .single();

      const categoryCode = category?.code || 'OTHER';

      // Create budget optimistically
      const budgetData = {
        user_id: user.id,
        name: `${intent.category} Budget`,
        category_code: categoryCode,
        total_limit: intent.amount,
        period: intent.timeframe,
        is_active: true,
        notes: intent.notes || '',
        category_limits: { [categoryCode]: intent.amount }
      };

      const { error } = await supabase
        .from('user_budgets')
        .insert([budgetData]);

      if (error) throw error;

      toast.success(`✨ Budget created: $${intent.amount} for ${intent.category}!`);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Perfect! I've created your $${intent.amount} ${intent.timeframe} budget for ${intent.category}. You can view it in your budget list above.`,
        timestamp: new Date()
      }]);

      setPendingBudgetIntent(null);
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-r from-primary to-yellow-600"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={className}
    >
      <Card className="flex flex-col h-[600px] backdrop-blur-xl bg-card/90 border-border/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-yellow-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Budget Assistant</h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Budget confirmation UI */}
                    {message.awaitingConfirmation && message.budgetIntent && (
                      <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                        <div className="space-y-1">
                          <p className="font-semibold">{message.budgetIntent.category}</p>
                          <p className="text-2xl font-bold">${message.budgetIntent.amount}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {message.budgetIntent.timeframe} • {message.budgetIntent.isRecurring ? 'Recurring' : 'One-time'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleBudgetConfirm(message.budgetIntent!)}
                            className="flex-1"
                            size="sm"
                          >
                            Confirm & Create
                          </Button>
                          <Button
                            onClick={() => {
                              setPendingBudgetIntent(null);
                              setMessages(prev => prev.map(m => 
                                m.timestamp === message.timestamp 
                                  ? { ...m, awaitingConfirmation: false }
                                  : m
                              ));
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Render components */}
                    {message.components && message.components.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {message.components.map((component, idx) => (
                          <div key={idx}>
                            <ComponentRenderer componentData={component} />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted/50 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your budget..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick suggestions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Show spending chart', 'Find savings', 'Budget health'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

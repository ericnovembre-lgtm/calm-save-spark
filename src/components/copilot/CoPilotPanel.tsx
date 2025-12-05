import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useCoPilot } from '@/contexts/CoPilotContext';
import { useCoPilotActions } from '@/hooks/useCoPilotActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { ComponentRenderer } from '@/components/generative-ui/ComponentRenderer';
import type { GenUIWidget } from '@/types/copilot';

// Global spotlight trigger - will be registered by CoPilotSpotlight
let globalSpotlightHandler: ((elementId: string) => void) | null = null;

export function registerSpotlightHandler(handler: (elementId: string) => void) {
  globalSpotlightHandler = handler;
}

export function unregisterSpotlightHandler() {
  globalSpotlightHandler = null;
}

export function CoPilotPanel() {
  const { isOpen, messages, greeting, addMessage, closeCoPilot, contextState } = useCoPilot();
  const { parseAndExecute } = useCoPilotActions();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Trigger spotlight on an element
  const triggerSpotlight = useCallback((elementId: string) => {
    if (globalSpotlightHandler) {
      globalSpotlightHandler(elementId);
    }
  }, []);
  
  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const userInput = input.trim();
    setInput('');
    
    addMessage({ role: 'user', content: userInput });
    setIsProcessing(true);
    
    // Try to execute as action first
    const { executed } = await parseAndExecute(userInput);
    
    if (!executed) {
      // Call AI endpoint for intelligent response
      try {
        const { data, error } = await supabase.functions.invoke('copilot-respond', {
          body: {
            message: userInput,
            context: {
              route: contextState.currentRoute,
              pageTitle: contextState.pageTitle,
              activeDataId: contextState.selectedDataId,
              userMood: contextState.userMood,
            },
          },
        });
        
        if (error) throw error;
        
        // Handle AI response
        const response = data as {
          message: string;
          action?: { type: string; payload?: Record<string, unknown> };
          spotlight?: string;
          widget?: GenUIWidget;
        };
        
        // Execute spotlight if specified
        if (response.spotlight) {
          triggerSpotlight(response.spotlight);
        }
        
        // Add message with optional widget
        addMessage({
          role: 'assistant',
          content: response.message,
          widget: response.widget,
        });
      } catch (err) {
        console.error('CoPilot AI error:', err);
        addMessage({
          role: 'assistant',
          content: `I understand you're asking about "${userInput}". Try commands like "go to dashboard", "switch to dark mode", or ask about your finances!`,
        });
      }
    }
    
    setIsProcessing(false);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  // Render widget from message
  const renderWidget = (widget: GenUIWidget) => {
    return (
      <div className="mt-2">
        <ComponentRenderer
          componentData={{
            type: widget.type,
            props: widget.props,
          }}
        />
      </div>
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={closeCoPilot}
          />
          
          {/* Panel */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm md:bottom-24 md:right-6 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 12rem)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Financial Co-Pilot</h3>
                  <p className="text-xs text-muted-foreground">{contextState.pageTitle}</p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea ref={scrollRef} className="h-64 p-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-foreground">{greeting.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {greeting.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        {msg.content}
                      </div>
                      {/* Render inline widget if present */}
                      {msg.widget && msg.role === 'assistant' && (
                        <div className="max-w-[85%] mt-2">
                          {renderWidget(msg.widget)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            
            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isProcessing}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

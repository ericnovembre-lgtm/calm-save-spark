import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';
import { useCoPilot } from '@/contexts/CoPilotContext';
import { useCoPilotActions } from '@/hooks/useCoPilotActions';
import { useVoiceMode } from '@/hooks/useVoiceMode';
import { useBrowserTTS } from '@/hooks/useBrowserTTS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { ComponentRenderer } from '@/components/generative-ui/ComponentRenderer';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = useIsMobile();
  
  // Browser TTS for AI responses
  const { speak, stop: stopTTS, isSpeaking } = useBrowserTTS();
  
  // Voice mode for speech-to-text
  const voiceMode = useVoiceMode({
    onTranscript: (text) => {
      setInput(text);
      // Auto-submit after transcript received
      if (text.trim()) {
        handleSubmitWithText(text);
      }
    },
    autoSubmit: true,
    enableBrowserTTS: ttsEnabled
  });
  
  // Trigger spotlight on an element
  const triggerSpotlight = useCallback((elementId: string) => {
    if (globalSpotlightHandler) {
      globalSpotlightHandler(elementId);
    }
  }, []);
  
  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !voiceModeActive) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, voiceModeActive]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);
  
  // Speak AI responses when TTS is enabled
  useEffect(() => {
    if (ttsEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        speak(lastMessage.content);
      }
    }
  }, [messages, ttsEnabled, speak]);

  const handleSubmitWithText = async (userInput: string) => {
    if (!userInput.trim() || isProcessing) return;
    
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitWithText(input.trim());
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const toggleVoiceMode = () => {
    if (voiceModeActive) {
      voiceMode.stopListening();
      setVoiceModeActive(false);
    } else {
      voiceMode.startListening();
      setVoiceModeActive(true);
    }
  };

  const toggleTTS = () => {
    if (ttsEnabled) {
      stopTTS();
    }
    setTtsEnabled(!ttsEnabled);
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

  // Panel animation variants
  const panelVariants = {
    hidden: isMobile 
      ? { y: '100%', opacity: 0 }
      : { x: '100%', opacity: 0 },
    visible: { x: 0, y: 0, opacity: 1 },
    exit: isMobile 
      ? { y: '100%', opacity: 0 }
      : { x: '100%', opacity: 0 }
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeCoPilot}
          />
          
          {/* Glassmorphism Sidebar Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={prefersReducedMotion ? {} : panelVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 
              ${isMobile 
                ? 'inset-x-0 bottom-0 h-[85vh] rounded-t-3xl' 
                : 'right-0 top-0 h-full w-96'
              }
              bg-white/80 dark:bg-slate-900/80 
              backdrop-blur-2xl 
              border-l border-t border-white/20 dark:border-white/10
              shadow-[0_0_50px_rgba(0,0,0,0.15)]
              flex flex-col overflow-hidden`}
            data-copilot-id="copilot-panel"
          >
            {/* Header with glassmorphism */}
            <div className="p-4 border-b border-white/10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Financial Co-Pilot</h3>
                    <p className="text-xs text-muted-foreground">{contextState.pageTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* TTS Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTTS}
                    className={`h-8 w-8 rounded-full ${ttsEnabled ? 'bg-primary/20 text-primary' : ''}`}
                    aria-label={ttsEnabled ? 'Disable voice responses' : 'Enable voice responses'}
                  >
                    {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeCoPilot}
                    className="h-8 w-8 rounded-full"
                    aria-label="Close Co-Pilot"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Voice mode indicator */}
              {voiceModeActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-primary"
                    />
                    <span className="text-sm text-primary font-medium">
                      {voiceMode.state === 'listening' && 'Listening...'}
                      {voiceMode.state === 'processing' && 'Processing...'}
                      {voiceMode.state === 'speaking' && 'Speaking...'}
                    </span>
                  </div>
                  {voiceMode.transcript && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      "{voiceMode.transcript}"
                    </p>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">{greeting.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {greeting.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-2 rounded-xl 
                          bg-white/60 dark:bg-slate-800/60 
                          backdrop-blur-sm
                          border border-white/20 dark:border-white/10
                          text-foreground 
                          hover:bg-white/80 dark:hover:bg-slate-700/60 
                          transition-all duration-200
                          shadow-sm hover:shadow-md"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-white/10 text-foreground shadow-sm'
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
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 dark:border-white/10">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            
            {/* Input with voice controls */}
            <div className="p-4 border-t border-white/10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                {/* Voice mode toggle */}
                <Button
                  type="button"
                  variant={voiceModeActive ? "default" : "outline"}
                  size="icon"
                  onClick={toggleVoiceMode}
                  className={`rounded-xl shrink-0 ${voiceModeActive ? 'bg-primary animate-pulse' : ''}`}
                  aria-label={voiceModeActive ? 'Stop voice input' : 'Start voice input'}
                >
                  {voiceModeActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={voiceModeActive ? "Listening..." : "Ask me anything..."}
                  className="flex-1 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-white/10"
                  disabled={isProcessing || voiceModeActive}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isProcessing}
                  className="rounded-xl shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

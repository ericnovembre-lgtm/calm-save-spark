import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Brain, Wand2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useDigitalTwinChat } from '@/hooks/useDigitalTwinChat';
import { ModelIndicatorBadge } from '@/components/coach/ModelIndicatorBadge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { WaveformVisualizer } from '@/components/voice/WaveformVisualizer';

interface ParsedLifeEvent {
  event_type: string;
  label: string;
  icon: string;
  year: number;
  financial_impact: number;
  ongoing_impact: number;
  description: string;
  confidence: number;
}

interface MobileTwinChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentAge?: number;
  onScenarioCreated?: (event: ParsedLifeEvent) => void;
}

export function MobileTwinChatSheet({ 
  isOpen, 
  onClose, 
  currentAge = 30, 
  onScenarioCreated 
}: MobileTwinChatSheetProps) {
  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isStreaming, currentModel, sendMessage, clearChat } = useDigitalTwinChat();
  const { isRecording, startRecording, stopRecording } = useVoiceRecording();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseNLScenario = useCallback(async (description: string) => {
    setIsParsing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-life-event-nl`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ description, currentAge }),
        }
      );

      if (!response.ok) throw new Error('Failed to parse scenario');

      const result = await response.json();
      if (result.event && onScenarioCreated) {
        onScenarioCreated(result.event);
        toast.success(`Created: ${result.event.label}`, {
          description: result.event.description,
        });
      }
      return result.event;
    } catch (error) {
      console.error('Parse NL scenario error:', error);
      toast.error('Failed to create scenario');
      return null;
    } finally {
      setIsParsing(false);
    }
  }, [currentAge, onScenarioCreated]);

  const isScenarioRequest = (text: string): boolean => {
    const patterns = [
      /what if/i, /what happens if/i, /simulate/i, /add.*event/i,
      /create.*scenario/i, /show.*impact/i, /buy.*house/i,
      /get.*raise/i, /lose.*job/i, /have.*child/i, /get married/i,
      /start.*business/i, /retire.*early/i,
    ];
    return patterns.some(p => p.test(text));
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || isParsing) return;
    
    const userInput = input;
    setInput('');
    
    if (isScenarioRequest(userInput) && onScenarioCreated) {
      sendMessage(userInput);
      setTimeout(async () => {
        await parseNLScenario(userInput);
      }, 500);
    } else {
      sendMessage(userInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      try {
        const audioBase64 = await stopRecording();
        if (audioBase64) {
          await transcribeAudio(audioBase64);
        }
      } catch (error) {
        console.error('Voice recording error:', error);
        toast.error('Failed to process voice');
      }
    } else {
      try {
        await startRecording();
        toast.info('Listening...', { duration: 2000 });
      } catch (error) {
        toast.error('Microphone access denied');
      }
    }
  };

  const transcribeAudio = async (audioBase64: string) => {
    setIsTranscribing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-to-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ audio: audioBase64 }),
        }
      );

      if (!response.ok) throw new Error('Transcription failed');

      const result = await response.json();
      if (result.text) {
        setInput(result.text);
        toast.success('Voice transcribed!', { duration: 1500 });
      }
    } catch (error) {
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const quickPrompts = [
    "What if I buy a house?",
    "Simulate having a child",
    "Early retirement probability?",
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[90vh] bg-stone-900/98 border-t border-amber-500/20">
        <DrawerHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <DrawerTitle className="text-white">Digital Twin Advisor</DrawerTitle>
            </div>
            <div className="flex items-center gap-2">
              {isParsing && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/20 rounded-full">
                  <Wand2 className="w-3 h-3 text-orange-400 animate-pulse" />
                  <span className="text-[10px] text-orange-300">Creating...</span>
                </div>
              )}
              {currentModel && !isParsing && (
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
                onClick={onClose}
                className="h-8 w-8 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/40 text-sm mt-8">
              <Brain className="w-10 h-10 mx-auto mb-3 text-amber-500/40" />
              <p className="mb-2">Ask about your financial future</p>
              <div className="space-y-2 mt-4">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt);
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60"
                  >
                    <Wand2 className="w-3 h-3 inline mr-2 text-orange-400" />
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
                  "max-w-[85%] rounded-lg px-4 py-2 text-sm",
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white'
                    : 'bg-white/5 border border-white/10 text-white/90'
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}

          {isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Indicator */}
        <AnimatePresence>
          {(isRecording || isTranscribing) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-3 border-t border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10"
            >
              <div className="flex items-center justify-center gap-3">
                {isRecording && (
                  <>
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-white/80 font-mono">Listening...</span>
                    <WaveformVisualizer isActive={isRecording} state="listening" />
                  </>
                )}
                {isTranscribing && (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-sm text-white/80 font-mono">Transcribing...</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-4 border-t border-white/10 pb-safe">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "Listening..." : "Ask anything..."}
              disabled={isStreaming || isParsing || isRecording || isTranscribing}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <Button
              onClick={handleVoiceToggle}
              disabled={isStreaming || isParsing || isTranscribing}
              size="icon"
              variant="outline"
              className={cn(
                "border-white/10 transition-all",
                isRecording 
                  ? "bg-red-500/20 border-red-500/50 text-red-400" 
                  : "bg-white/5 text-white/60"
              )}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleSend}
              disabled={isStreaming || isParsing || isRecording || isTranscribing || !input.trim()}
              size="icon"
              className="bg-gradient-to-r from-amber-500 to-orange-500"
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
      </DrawerContent>
    </Drawer>
  );
}
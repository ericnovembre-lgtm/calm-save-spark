import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Sparkles, Loader2, Brain, Wand2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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

interface TwinChatPanelProps {
  className?: string;
  currentAge?: number;
  onScenarioCreated?: (event: ParsedLifeEvent) => void;
}

export function TwinChatPanel({ className, currentAge = 30, onScenarioCreated }: TwinChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isStreaming, currentModel, sendMessage, clearChat } = useDigitalTwinChat();
  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecording();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse natural language scenario
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

      if (!response.ok) {
        throw new Error('Failed to parse scenario');
      }

      const result = await response.json();
      if (result.event && onScenarioCreated) {
        onScenarioCreated(result.event);
        toast.success(`Created: ${result.event.label} at age ${result.event.year}`, {
          description: result.event.description,
        });
      }
      return result.event;
    } catch (error) {
      console.error('Parse NL scenario error:', error);
      toast.error('Failed to create scenario from description');
      return null;
    } finally {
      setIsParsing(false);
    }
  }, [currentAge, onScenarioCreated]);

  // Check if message is a scenario request
  const isScenarioRequest = (text: string): boolean => {
    const patterns = [
      /what if/i,
      /what happens if/i,
      /simulate/i,
      /add.*event/i,
      /create.*scenario/i,
      /show.*impact/i,
      /buy.*house/i,
      /get.*raise/i,
      /lose.*job/i,
      /have.*child/i,
      /get married/i,
      /start.*business/i,
      /retire.*early/i,
    ];
    return patterns.some(p => p.test(text));
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || isParsing) return;
    
    const userInput = input;
    setInput('');
    
    // If it looks like a scenario request, try to parse and visualize it
    if (isScenarioRequest(userInput) && onScenarioCreated) {
      // First send to AI for response, then try to parse for visualization
      sendMessage(userInput);
      
      // Delayed parse for visualization (let AI respond first)
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

  // Voice recording handlers
  const handleVoiceToggle = async () => {
    if (isRecording) {
      try {
        const audioBase64 = await stopRecording();
        if (audioBase64) {
          await transcribeAudio(audioBase64);
        }
      } catch (error) {
        console.error('Voice recording error:', error);
        toast.error('Failed to process voice recording');
      }
    } else {
      try {
        await startRecording();
        toast.info('Listening...', { duration: 2000 });
      } catch (error) {
        console.error('Failed to start recording:', error);
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

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      if (result.text) {
        setInput(result.text);
        toast.success('Voice transcribed!', { duration: 1500 });
        
        // Auto-send if it's a scenario request
        if (isScenarioRequest(result.text)) {
          setTimeout(() => {
            handleSend();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const quickPrompts = [
    "What if I buy a $400k house in 2 years?",
    "How does having a child affect my timeline?",
    "What's my probability of early retirement?",
    "Simulate getting a 20% raise next year",
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
                  {isParsing && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-500/20 rounded-full">
                      <Wand2 className="w-3 h-3 text-violet-400 animate-pulse" />
                      <span className="text-[10px] text-violet-300">Creating...</span>
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
                    <Brain className="w-12 h-12 mx-auto mb-3 text-cyan-500/40" />
                    <p className="mb-2">Ask me anything about your financial future</p>
                    <p className="text-xs text-white/30 mb-4">
                      Tip: Describe "what if" scenarios and I'll visualize them on your timeline!
                    </p>
                    <div className="space-y-2">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInput(prompt);
                            setTimeout(() => handleSend(), 100);
                          }}
                          className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60 hover:text-white"
                        >
                          <Wand2 className="w-3 h-3 inline mr-2 text-violet-400" />
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

              {/* Voice Indicator */}
              <AnimatePresence>
                {(isRecording || isTranscribing) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3 border-t border-white/10 bg-gradient-to-r from-cyan-500/10 to-violet-500/10"
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
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                          <span className="text-sm text-white/80 font-mono">Transcribing...</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isRecording ? "Listening..." : "Describe a 'what if' scenario..."}
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
                        ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30" 
                        : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    {isRecording ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={isStreaming || isParsing || isRecording || isTranscribing || !input.trim()}
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

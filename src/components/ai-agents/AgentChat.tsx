import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentChat } from '@/hooks/useAgentChat';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ComponentRenderer } from '@/components/generative-ui';

interface AgentChatProps {
  agentType: string;
  conversationId?: string;
  initialContext?: Record<string, any>;
  placeholder?: string;
  className?: string;
}

export function AgentChat({
  agentType,
  conversationId,
  initialContext,
  placeholder = 'Ask me anything...',
  className,
}: AgentChatProps) {
  const [input, setInput] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { messages, isLoading, sendMessage } = useAgentChat({
    agentType,
    conversationId,
    onMessageReceived: (message) => {
      if (autoSpeak) {
        speak(message);
      }
    },
  });

  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecording();
  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message, initialContext);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        const audioBase64 = await stopRecording();
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: audioBase64 },
        });

        if (error) throw error;

        if (data?.text) {
          setInput(data.text);
          toast.success('Transcription complete');
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
        toast.error('Failed to transcribe audio');
        cancelRecording();
      }
    } else {
      await startRecording();
    }
  };

  const toggleAutoSpeak = () => {
    if (autoSpeak && isSpeaking) {
      stopSpeaking();
    }
    setAutoSpeak(!autoSpeak);
  };

  const handleComponentAction = async (actionType: string, data: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-ui-action`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ actionType, actionData: data })
        }
      );

      if (!response.ok) throw new Error('Action failed');

      const result = await response.json();
      toast.success('Action completed successfully!');
      
      // Send confirmation to AI
      await sendMessage(`Action completed: ${actionType}`, initialContext);

    } catch (error) {
      console.error('Action error:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex w-full',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-foreground border border-border/50'
                  )}
                >
                  {message.componentData ? (
                    <ComponentRenderer 
                      componentData={message.componentData}
                      onAction={handleComponentAction}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={handleVoiceInput}
                disabled={isLoading || isProcessing}
                className="shrink-0"
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant={autoSpeak ? 'default' : 'outline'}
                onClick={toggleAutoSpeak}
                disabled={isLoading}
                className="shrink-0"
                title={autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
              >
                {autoSpeak ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[60px] max-h-[200px] resize-none bg-muted/30"
              disabled={isLoading || isRecording}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || isRecording}
              className="h-[60px] w-[60px] shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

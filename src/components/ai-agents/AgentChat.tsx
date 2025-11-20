import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion-variants';
import { cn } from '@/lib/utils';
import { useAgentChat } from '@/hooks/useAgentChat';
import { useVoiceMode } from '@/hooks/useVoiceMode';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ComponentRenderer } from '@/components/generative-ui';
import { VoiceModeButton } from '@/components/voice/VoiceModeButton';
import { VoiceModeInterface } from '@/components/voice/VoiceModeInterface';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DocumentUpload } from './DocumentUpload';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useEmotionDetection } from '@/hooks/useEmotionDetection';

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
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Emotion detection
  const { detectEmotion } = useEmotionDetection();

  const { messages, isLoading, sendMessage } = useAgentChat({
    agentType,
    conversationId,
    onMessageReceived: (message) => {
      if (voiceModeActive && voiceMode.state !== 'idle') {
        voiceMode.speakResponse(message);
      }
    },
  });

  const voiceMode = useVoiceMode({
    onTranscript: (text) => {
      handleSubmit(undefined, text);
    },
    autoSubmit: true,
    enableBrowserTTS: true
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, messageText?: string) => {
    e?.preventDefault();
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    // Detect emotion from user input
    const emotionResult = detectEmotion(text);

    const message = text;
    setInput('');
    
    // Send message with emotion context
    await sendMessage(message, {
      ...initialContext,
      emotion: emotionResult
    });
  };

  const handleVoiceModeToggle = () => {
    if (voiceModeActive) {
      voiceMode.stopListening();
      setVoiceModeActive(false);
    } else {
      voiceMode.startListening();
      setVoiceModeActive(true);
    }
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
          {messages.map((message, index) => (
            <motion.div
              key={`${message.timestamp}-${index}`}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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

          {isLoading && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-3xl mx-auto space-y-3">
          <Collapsible open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
            <CollapsibleContent>
              <DocumentUpload 
                conversationId={conversationId}
                onUploadComplete={(docId) => {
                  sendMessage(`I've uploaded a document (ID: ${docId}). Can you analyze it?`, initialContext);
                  setShowDocumentUpload(false);
                }}
              />
            </CollapsibleContent>
          </Collapsible>

          <form onSubmit={handleSubmit} className="relative">
            <VoiceModeInterface
              isActive={voiceModeActive}
              state={voiceMode.state}
              transcript={voiceMode.transcript}
              audioData={voiceMode.audioData}
              onStop={handleVoiceModeToggle}
              onSubmit={voiceMode.submitTranscript}
            />
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              className="min-h-[60px] max-h-[200px] resize-none pr-32"
              disabled={isLoading || voiceModeActive}
            />
            
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                disabled={isLoading}
                title="Upload document"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <VoiceModeButton
                isActive={voiceModeActive}
                onToggle={handleVoiceModeToggle}
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || voiceModeActive}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

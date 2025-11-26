import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Radio } from 'lucide-react';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { motion, AnimatePresence } from 'framer-motion';

interface RealtimeVoiceInterfaceProps {
  systemPrompt?: string;
}

export function RealtimeVoiceInterface({ systemPrompt }: RealtimeVoiceInterfaceProps) {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const { isConnected, isSpeaking, isAISpeaking, connect, disconnect } = useRealtimeVoice({
    systemPrompt,
    onTranscript: (text, isFinal) => {
      setTranscript(text);
    },
    onResponse: (text) => {
      setResponse(text);
    },
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Voice Mode</h3>
            <p className="text-sm text-muted-foreground">
              Have a natural conversation with AI
            </p>
          </div>
          <Button
            variant={isConnected ? 'destructive' : 'default'}
            onClick={isConnected ? disconnect : connect}
          >
            {isConnected ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>

        {/* Status Indicator */}
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-muted rounded-lg"
            >
              <div className="relative">
                <Radio className={`w-5 h-5 ${isSpeaking ? 'text-green-500' : isAISpeaking ? 'text-blue-500' : 'text-muted-foreground'}`} />
                {(isSpeaking || isAISpeaking) && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-current opacity-20"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {isSpeaking ? 'Listening...' : isAISpeaking ? 'AI Speaking...' : 'Ready'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSpeaking ? 'Speak naturally' : isAISpeaking ? 'Processing response' : 'Start speaking anytime'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript Display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-primary/5 rounded-lg border border-primary/10"
          >
            <p className="text-xs text-muted-foreground mb-1">You said:</p>
            <p className="text-sm text-foreground">{transcript}</p>
          </motion.div>
        )}

        {/* Response Display */}
        {response && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-accent/50 rounded-lg"
          >
            <p className="text-xs text-muted-foreground mb-1">AI Response:</p>
            <p className="text-sm text-foreground">{response}</p>
          </motion.div>
        )}

        {/* Instructions */}
        {!isConnected && (
          <div className="text-center text-sm text-muted-foreground">
            Click "Connect" to start a voice conversation
          </div>
        )}
      </div>
    </Card>
  );
}

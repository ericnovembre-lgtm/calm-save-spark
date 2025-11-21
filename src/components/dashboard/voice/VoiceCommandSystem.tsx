import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function VoiceCommandSystem() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports Web Speech API
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser');
      return;
    }

    setIsListening(true);
    setTranscript('Listening...');

    // Simulate voice recognition (in production, use Web Speech API)
    setTimeout(() => {
      const commands = [
        'Transfer $100 to vacation fund',
        'Show me my spending this month',
        'Create a new goal for emergency fund',
        'What\'s my total balance?'
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setTranscript(randomCommand);
      
      setTimeout(() => {
        setIsListening(false);
        processCommand(randomCommand);
      }, 1500);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    setTranscript('');
  };

  const processCommand = (command: string) => {
    toast.success(`Processing: ${command}`, {
      icon: <Volume2 className="w-4 h-4" />
    });
    
    // Speak response (in production, use Web Speech API)
    setTranscript('');
  };

  return (
    <>
      {/* Voice Button */}
      <motion.div
        className="fixed bottom-44 left-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-primary hover:bg-primary/90'
          }`}
          onClick={isListening ? stopListening : startListening}
        >
          <motion.div
            animate={isListening ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1]
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-64 left-6 z-50 bg-card border border-border rounded-xl p-4 shadow-lg max-w-xs"
          >
            <div className="flex items-center gap-3">
              {isListening && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-3 h-3 rounded-full bg-red-500"
                />
              )}
              <p className="text-sm">{transcript}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

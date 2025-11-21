import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrowserTTS } from '@/hooks/useBrowserTTS';

export function VoiceHubControl() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { speak } = useBrowserTTS();

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      speak('Voice control activated. How can I help you navigate the hub?');
      
      // Simulate voice recognition
      setTimeout(() => {
        setTranscript('Show me my budget');
        setTimeout(() => {
          setIsListening(false);
          setTranscript('');
        }, 2000);
      }, 2000);
    } else {
      setIsListening(false);
      setTranscript('');
    }
  };

  return (
    <div className="fixed bottom-24 left-6 z-40">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10 }}
      >
        <Button
          onClick={toggleListening}
          size="lg"
          className={`rounded-full w-16 h-16 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          <motion.div
            animate={isListening ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </motion.div>
        </Button>
      </motion.div>
      
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-lg bg-card shadow-lg text-sm"
        >
          {transcript}
        </motion.div>
      )}
    </div>
  );
}

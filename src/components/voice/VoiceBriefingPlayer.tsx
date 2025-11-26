import { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useElevenLabsVoice } from '@/hooks/useElevenLabsVoice';
import { motion } from 'framer-motion';

interface VoiceBriefingPlayerProps {
  text: string;
  voiceId?: string;
  className?: string;
}

export function VoiceBriefingPlayer({ text, voiceId, className }: VoiceBriefingPlayerProps) {
  const { isSpeaking, isLoading, speak, stop } = useElevenLabsVoice();

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, voiceId);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant="ghost"
      size="sm"
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSpeaking ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Volume2 className="w-4 h-4" />
          </motion.div>
          <span className="ml-2">Stop</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span className="ml-2">Listen</span>
        </>
      )}
    </Button>
  );
}

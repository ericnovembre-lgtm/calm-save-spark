import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voice: string = 'alloy') => {
    try {
      setIsSpeaking(true);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice },
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio element and play
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        toast.error('Failed to play audio');
      };

      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
      toast.error('Failed to generate speech');
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
  };
}

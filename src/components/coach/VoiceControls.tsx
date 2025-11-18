import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  ttsEnabled: boolean;
  onTtsToggle: () => void;
  disabled?: boolean;
}

export function VoiceControls({
  onTranscript,
  ttsEnabled,
  onTtsToggle,
  disabled
}: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error("Voice recognition error. Please try again.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      setVoiceAvailable(true);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleVoiceInput = () => {
    if (!voiceAvailable) {
      toast.error("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success("Listening... Speak now.");
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error("Could not start voice recognition.");
      }
    }
  };

  if (!voiceAvailable) return null;

  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          type="button"
          size="sm"
          variant={isListening ? "destructive" : "outline"}
          onClick={toggleVoiceInput}
          disabled={disabled}
          className="gap-2"
          aria-label={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              <span className="text-xs">Listening...</span>
            </>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          type="button"
          size="sm"
          variant={ttsEnabled ? "default" : "outline"}
          onClick={onTtsToggle}
          className="gap-2"
          aria-label={ttsEnabled ? "Disable voice responses" : "Enable voice responses"}
        >
          {ttsEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </div>
  );
}

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import triggerHaptic from '@/lib/haptics';

// Extend window for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface ParsedTransaction {
  amount: number;
  merchant: string;
  category?: string;
  transaction_date: string;
  confidence: number;
}

interface VoiceTransactionState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  parsedTransaction: ParsedTransaction | null;
  error: string | null;
}

export function useVoiceTransaction() {
  const [state, setState] = useState<VoiceTransactionState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    parsedTransaction: null,
    error: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      triggerHaptic('medium');
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        transcript: '', 
        parsedTransaction: null,
        error: null 
      }));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setState(prev => ({ ...prev, transcript }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      triggerHaptic('light');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: `Recognition error: ${event.error}` 
      }));
      triggerHaptic('heavy');
    };

    recognition.start();
  }, [isSupported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Parse the transcript using AI
  const parseTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return null;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const { data, error } = await supabase.functions.invoke('parse-voice-transaction', {
        body: { text }
      });

      if (error) throw error;

      const parsed = data as ParsedTransaction;
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        parsedTransaction: parsed 
      }));

      triggerHaptic('medium');
      return parsed;
    } catch (err) {
      console.error('Failed to parse transaction:', err);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: 'Failed to parse transaction' 
      }));
      toast.error('Could not understand the transaction');
      return null;
    }
  }, []);

  // Process voice input end-to-end
  const processVoiceInput = useCallback(async () => {
    if (state.isListening) {
      stopListening();
      // Wait a moment for final transcript
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (state.transcript) {
      return parseTranscript(state.transcript);
    }
    return null;
  }, [state.isListening, state.transcript, stopListening, parseTranscript]);

  // Reset state
  const reset = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState({
      isListening: false,
      isProcessing: false,
      transcript: '',
      parsedTransaction: null,
      error: null
    });
  }, []);

  return {
    ...state,
    isSupported,
    startListening,
    stopListening,
    parseTranscript,
    processVoiceInput,
    reset
  };
}

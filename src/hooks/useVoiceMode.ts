import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';
import { useBrowserTTS } from './useBrowserTTS';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface UseVoiceModeOptions {
  onTranscript: (text: string) => void;
  onResponse?: (text: string) => void;
  autoSubmit?: boolean;
  enableBrowserTTS?: boolean;
}

export function useVoiceMode({
  onTranscript,
  onResponse,
  autoSubmit = true,
  enableBrowserTTS = true
}: UseVoiceModeOptions) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [audioData, setAudioData] = useState<Uint8Array>();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const { speak: browserSpeak, stop: stopBrowserTTS, isSpeaking: isBrowserSpeaking } = useBrowserTTS();

  const { processAudioData, reset: resetVAD } = useVoiceActivityDetection({
    enabled: autoSubmit && state === 'listening',
    silenceThreshold: 0.015,
    silenceDuration: 1500,
    onSilenceDetected: () => {
      if (transcript.trim()) {
        submitTranscript();
      }
    }
  });

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || state !== 'listening') return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    setAudioData(new Uint8Array(dataArray));
    processAudioData(dataArray);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [state, processAudioData]);

  const startListening = useCallback(async () => {
    try {
      setState('listening');
      setTranscript('');
      resetVAD();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Set up Web Audio API for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start audio analysis
      analyzeAudio();

      // Set up Web Speech API for transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = (finalTranscript + interimTranscript).trim();
          setTranscript(fullTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            toast.error('Voice recognition error. Please try again.');
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        toast.error('Speech recognition not supported in this browser');
      }

    } catch (error) {
      console.error('Error starting voice mode:', error);
      toast.error('Could not access microphone');
      setState('idle');
    }
  }, [analyzeAudio, resetVAD]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    setState('idle');
    resetVAD();
  }, [resetVAD]);

  const submitTranscript = useCallback(() => {
    if (!transcript.trim()) return;

    setState('processing');
    onTranscript(transcript);
    
    // Reset transcript after submission
    setTimeout(() => {
      setTranscript('');
      if (state !== 'idle') {
        setState('listening');
      }
    }, 500);
  }, [transcript, onTranscript, state]);

  const speakResponse = useCallback((text: string) => {
    setState('speaking');
    
    if (enableBrowserTTS) {
      browserSpeak(text);
    }

    if (onResponse) {
      onResponse(text);
    }
  }, [enableBrowserTTS, browserSpeak, onResponse]);

  const stopSpeaking = useCallback(() => {
    if (enableBrowserTTS) {
      stopBrowserTTS();
    }
    setState('listening');
  }, [enableBrowserTTS, stopBrowserTTS]);

  useEffect(() => {
    // Update state when browser TTS finishes
    if (!isBrowserSpeaking && state === 'speaking') {
      setState('listening');
    }
  }, [isBrowserSpeaking, state]);

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    state,
    transcript,
    audioData,
    startListening,
    stopListening,
    submitTranscript,
    speakResponse,
    stopSpeaking
  };
}

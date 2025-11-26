import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioRecorder, encodeAudioForAPI } from '@/lib/audio/AudioRecorder';
import { playAudioData, clearAudioQueue } from '@/lib/audio/AudioPlayer';
import { toast } from 'sonner';

interface UseRealtimeVoiceOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  systemPrompt?: string;
}

export function useRealtimeVoice({
  onTranscript,
  onResponse,
  systemPrompt = 'You are a helpful financial assistant.'
}: UseRealtimeVoiceOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptBufferRef = useRef<string>('');

  const connect = useCallback(async () => {
    try {
      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      // Connect WebSocket
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'gmnpjgelzsmcidwrwbcg';
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-voice`;
      
      console.log('Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Send session configuration after connection
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: systemPrompt,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
            }
          }));
        }, 100);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received event:', data.type);

          switch (data.type) {
            case 'session.created':
              console.log('Session created successfully');
              break;

            case 'session.updated':
              console.log('Session updated');
              startRecording();
              break;

            case 'input_audio_buffer.speech_started':
              setIsSpeaking(true);
              break;

            case 'input_audio_buffer.speech_stopped':
              setIsSpeaking(false);
              break;

            case 'response.audio.delta':
              setIsAISpeaking(true);
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(audioContextRef.current!, bytes);
              break;

            case 'response.audio.done':
              setIsAISpeaking(false);
              break;

            case 'response.audio_transcript.delta':
              transcriptBufferRef.current += data.delta;
              onTranscript?.(transcriptBufferRef.current, false);
              break;

            case 'response.audio_transcript.done':
              onResponse?.(transcriptBufferRef.current);
              transcriptBufferRef.current = '';
              break;

            case 'error':
              console.error('OpenAI error:', data.error);
              toast.error(`Error: ${data.error.message || 'Unknown error'}`);
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsSpeaking(false);
        setIsAISpeaking(false);
        stopRecording();
      };

    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect to voice service');
    }
  }, [systemPrompt, onTranscript, onResponse]);

  const startRecording = useCallback(async () => {
    if (recorderRef.current) return;

    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encoded = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encoded
          }));
        }
      });

      await recorderRef.current.start();
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    stopRecording();
    clearAudioQueue();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
    setIsAISpeaking(false);
  }, [stopRecording]);

  const sendText = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text
        }]
      }
    }));

    wsRef.current.send(JSON.stringify({
      type: 'response.create'
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isSpeaking,
    isAISpeaking,
    connect,
    disconnect,
    sendText,
  };
}

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            setIsProcessing(false);
            resolve(base64Audio);
          };

          reader.onerror = () => {
            setIsProcessing(false);
            reject(new Error('Failed to process audio'));
          };

          // Stop all tracks
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          setIsProcessing(false);
          reject(error);
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      chunksRef.current = [];
    }
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

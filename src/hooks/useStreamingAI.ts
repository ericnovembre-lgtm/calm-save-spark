import { useState, useCallback, useRef, useEffect } from 'react';

export type StreamPhase = 'idle' | 'connecting' | 'streaming' | 'parsing' | 'complete' | 'error';

export interface StreamingState {
  status: StreamPhase;
  streamedText: string;
  tokens: string[];
  tokensPerSecond: number;
  estimatedProgress: number;
  error: string | null;
  startTime: number | null;
  elapsedMs: number;
}

interface UseStreamingAIOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
  onPhaseChange?: (phase: StreamPhase) => void;
}

const initialState: StreamingState = {
  status: 'idle',
  streamedText: '',
  tokens: [],
  tokensPerSecond: 0,
  estimatedProgress: 0,
  error: null,
  startTime: null,
  elapsedMs: 0,
};

export function useStreamingAI(options: UseStreamingAIOptions = {}) {
  const [state, setState] = useState<StreamingState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const tokenCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update elapsed time while streaming
  useEffect(() => {
    if (state.status === 'streaming' && state.startTime) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          elapsedMs: Date.now() - (prev.startTime || Date.now()),
          tokensPerSecond: prev.startTime 
            ? (tokenCountRef.current / ((Date.now() - prev.startTime) / 1000)) 
            : 0,
        }));
      }, 100);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status, state.startTime]);

  const setPhase = useCallback((phase: StreamPhase) => {
    setState(prev => ({ ...prev, status: phase }));
    options.onPhaseChange?.(phase);
  }, [options]);

  const startStream = useCallback(async (url: string, body?: object) => {
    // Reset state
    setState({
      ...initialState,
      status: 'connecting',
      startTime: Date.now(),
    });
    tokenCountRef.current = 0;

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      setPhase('streaming');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setPhase('complete');
              options.onComplete?.(fullText);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle different streaming formats
              const token = parsed.token || 
                           parsed.delta?.content || 
                           parsed.choices?.[0]?.delta?.content ||
                           parsed.text ||
                           '';
              
              if (token) {
                fullText += token;
                tokenCountRef.current++;
                
                setState(prev => ({
                  ...prev,
                  streamedText: fullText,
                  tokens: [...prev.tokens, token],
                  estimatedProgress: Math.min(95, (fullText.length / 500) * 100),
                }));
                
                options.onToken?.(token);
              }
            } catch {
              // Non-JSON line, might be streaming_text event
              if (data.includes('streaming_text')) {
                try {
                  const textMatch = data.match(/"text":"([^"]+)"/);
                  if (textMatch) {
                    const token = textMatch[1];
                    fullText += token;
                    tokenCountRef.current++;
                    
                    setState(prev => ({
                      ...prev,
                      streamedText: fullText,
                      tokens: [...prev.tokens, token],
                    }));
                    
                    options.onToken?.(token);
                  }
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }
        }
      }

      // Handle any remaining buffer
      if (buffer.trim()) {
        setPhase('parsing');
      }

      setPhase('complete');
      setState(prev => ({ ...prev, estimatedProgress: 100 }));
      options.onComplete?.(fullText);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setPhase('idle');
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Stream failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      options.onError?.(errorMessage);
    }
  }, [setPhase, options]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setPhase('idle');
    setState(prev => ({ ...prev, estimatedProgress: 0 }));
  }, [setPhase]);

  const reset = useCallback(() => {
    cancelStream();
    setState(initialState);
    tokenCountRef.current = 0;
  }, [cancelStream]);

  return {
    ...state,
    startStream,
    cancelStream,
    reset,
    isActive: state.status === 'connecting' || state.status === 'streaming',
  };
}

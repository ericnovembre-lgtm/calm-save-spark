import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TwinMemory {
  id: string;
  score: number;
  content: string;
  category: 'scenario' | 'insight' | 'preference' | 'pattern' | 'conversation';
  importance: number;
  createdAt: string;
}

export function useDigitalTwinMemory() {
  const [isLoading, setIsLoading] = useState(false);
  const [memories, setMemories] = useState<TwinMemory[]>([]);

  const storeMemory = useCallback(async (
    content: string,
    category: TwinMemory['category'] = 'conversation',
    importance: number = 0.5
  ) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/digital-twin-memory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'store',
            content,
            category,
            importance,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to store memory');
      }

      const result = await response.json();
      return result.memoryId;
    } catch (error) {
      console.error('Store memory error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retrieveMemories = useCallback(async (
    query: string,
    topK: number = 5
  ): Promise<TwinMemory[]> => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/digital-twin-memory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'retrieve',
            query,
            topK,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retrieve memories');
      }

      const result = await response.json();
      setMemories(result.memories || []);
      return result.memories || [];
    } catch (error) {
      console.error('Retrieve memories error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rememberScenario = useCallback(async (
    scenarioName: string,
    events: any[],
    successProbability: number
  ) => {
    const content = `Scenario "${scenarioName}": ${events.length} life events with ${Math.round(successProbability)}% success probability. Events: ${events.map(e => e.event?.label || e.label).join(', ')}.`;
    return storeMemory(content, 'scenario', 0.8);
  }, [storeMemory]);

  const rememberInsight = useCallback(async (insight: string) => {
    return storeMemory(insight, 'insight', 0.7);
  }, [storeMemory]);

  const rememberPreference = useCallback(async (preference: string) => {
    return storeMemory(preference, 'preference', 0.9);
  }, [storeMemory]);

  const getRelevantContext = useCallback(async (
    currentMessage: string
  ): Promise<string> => {
    const memories = await retrieveMemories(currentMessage, 3);
    
    if (memories.length === 0) return '';

    const contextParts = memories.map(m => 
      `[${m.category.toUpperCase()}] ${m.content}`
    );

    return `\n\n**Remembered Context:**\n${contextParts.join('\n')}`;
  }, [retrieveMemories]);

  return {
    isLoading,
    memories,
    storeMemory,
    retrieveMemories,
    rememberScenario,
    rememberInsight,
    rememberPreference,
    getRelevantContext,
  };
}

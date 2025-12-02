import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TwinMemory {
  id: string;
  score?: number;
  content: string;
  category: 'scenario' | 'insight' | 'preference' | 'pattern' | 'conversation';
  importance: number;
  createdAt: string;
}

export function useDigitalTwinMemory() {
  const [isLoading, setIsLoading] = useState(false);
  const [memories, setMemories] = useState<TwinMemory[]>([]);
  const [allMemories, setAllMemories] = useState<TwinMemory[]>([]);

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
      toast.success('Memory stored successfully');
      return result.memoryId;
    } catch (error) {
      console.error('Store memory error:', error);
      toast.error('Failed to store memory');
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

  const listMemories = useCallback(async (
    filterCategory?: TwinMemory['category']
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
            action: 'list',
            filterCategory,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to list memories');
      }

      const result = await response.json();
      setAllMemories(result.memories || []);
      return result.memories || [];
    } catch (error) {
      console.error('List memories error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMemory = useCallback(async (memoryId: string): Promise<boolean> => {
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
            action: 'delete',
            memoryId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete memory');
      }

      // Remove from local state
      setAllMemories(prev => prev.filter(m => m.id !== memoryId));
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      
      toast.success('Memory deleted');
      return true;
    } catch (error) {
      console.error('Delete memory error:', error);
      toast.error('Failed to delete memory');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshMemories = useCallback(async () => {
    return listMemories();
  }, [listMemories]);

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
    allMemories,
    storeMemory,
    retrieveMemories,
    listMemories,
    deleteMemory,
    refreshMemories,
    rememberScenario,
    rememberInsight,
    rememberPreference,
    getRelevantContext,
  };
}

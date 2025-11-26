import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinancialMemory {
  id?: string;
  content: string;
  category: 'goal' | 'preference' | 'insight' | 'decision' | 'pattern';
  importance: number;
  timestamp?: number;
  userId?: string;
}

export interface MemoryMatch {
  id: string;
  score: number;
  metadata: {
    userId: string;
    timestamp: number;
    category: string;
    content: string;
    importance: number;
  };
}

export function useFinancialMemory() {
  const [isLoading, setIsLoading] = useState(false);
  const [memories, setMemories] = useState<MemoryMatch[]>([]);

  const storeMemory = async (memory: FinancialMemory) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('pinecone-memory', {
        body: {
          action: 'store',
          userId: user.id,
          memory: {
            content: memory.content,
            category: memory.category,
            importance: memory.importance,
          },
        },
      });

      if (error) throw error;

      toast.success('Memory stored successfully');
      return data;
    } catch (error) {
      console.error('Error storing memory:', error);
      toast.error('Failed to store memory');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const retrieveMemories = async (query: string, topK: number = 5) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('pinecone-memory', {
        body: {
          action: 'retrieve',
          userId: user.id,
          query,
          topK,
        },
      });

      if (error) throw error;

      setMemories(data.memories || []);
      return data.memories || [];
    } catch (error) {
      console.error('Error retrieving memories:', error);
      toast.error('Failed to retrieve memories');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalMemories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_type', 'financial_memory')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching local memories:', error);
      return [];
    }
  };

  return {
    storeMemory,
    retrieveMemories,
    getLocalMemories,
    memories,
    isLoading,
  };
}

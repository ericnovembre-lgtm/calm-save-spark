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

  const rememberFact = async (fact: string, category: FinancialMemory['category'] = 'preference') => {
    return storeMemory({
      content: fact,
      category,
      importance: 0.9,
    });
  };

  const learnFromConversation = async (userMessage: string, assistantResponse: string) => {
    // Extract insights from conversation
    const insights: string[] = [];

    // Pattern: User mentions a financial goal
    const goalPattern = /(?:saving|planning|hoping) (?:to|for) (.+)/i;
    const goalMatch = userMessage.match(goalPattern);
    if (goalMatch) {
      insights.push(`User goal: ${goalMatch[1]}`);
    }

    // Pattern: User mentions spending habits
    const spendingPattern = /i (?:spend|spent|buy) (.+)/i;
    const spendingMatch = userMessage.match(spendingPattern);
    if (spendingMatch) {
      insights.push(`Spending habit: ${spendingMatch[1]}`);
    }

    // Pattern: User mentions preferences
    const preferencePattern = /i (?:prefer|like|love|want) (.+)/i;
    const preferenceMatch = userMessage.match(preferencePattern);
    if (preferenceMatch) {
      insights.push(`Preference: ${preferenceMatch[1]}`);
    }

    // Store extracted insights
    for (const insight of insights) {
      await storeMemory({
        content: insight,
        category: 'insight',
        importance: 0.7,
      });
    }
  };

  return {
    storeMemory,
    retrieveMemories,
    getLocalMemories,
    rememberFact,
    learnFromConversation,
    memories,
    isLoading,
  };
}

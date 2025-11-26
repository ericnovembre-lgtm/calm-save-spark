import { useState, useEffect } from 'react';
import { useFinancialMemory } from './useFinancialMemory';

export interface MemoryInsight {
  type: 'pattern' | 'recommendation' | 'reminder' | 'achievement';
  title: string;
  description: string;
  importance: number;
  relatedMemories: string[];
}

export function useMemoryInsights() {
  const [insights, setInsights] = useState<MemoryInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { retrieveMemories, getLocalMemories } = useFinancialMemory();

  const generateInsights = async (context?: string) => {
    setIsLoading(true);
    try {
      // Get recent memories
      const localMemories = await getLocalMemories();
      
      // Get semantic memories if context provided
      let semanticMemories = [];
      if (context) {
        semanticMemories = await retrieveMemories(context, 10);
      }

      // Analyze patterns
      const patterns = analyzePatterns(localMemories);
      const recommendations = generateRecommendations(localMemories, semanticMemories);
      
      setInsights([...patterns, ...recommendations]);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePatterns = (memories: Array<Record<string, any>>): MemoryInsight[] => {
    const insights: MemoryInsight[] = [];

    // Group by category
    const categoryGroups = memories.reduce((acc, mem) => {
      const cat = mem.memory_type;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(mem);
      return acc;
    }, {} as Record<string, Array<Record<string, any>>>);

    // Find patterns
    Object.entries(categoryGroups).forEach(([category, mems]) => {
      if (mems.length >= 3) {
        insights.push({
          type: 'pattern',
          title: `${category} Pattern Detected`,
          description: `You have ${mems.length} ${category} memories recorded`,
          importance: 0.7,
          relatedMemories: mems.map(m => m.id),
        });
      }
    });

    return insights;
  };

  const generateRecommendations = (localMems: Array<Record<string, any>>, semanticMems: Array<Record<string, any>>): MemoryInsight[] => {
    const insights: MemoryInsight[] = [];

    // Check for goal-related memories
    const goalMemories = localMems.filter(m => m.memory_type === 'goal');
    if (goalMemories.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Review Your Goals',
        description: 'You have active financial goals that could use your attention',
        importance: 0.8,
        relatedMemories: goalMemories.map(m => m.id),
      });
    }

    // Check for preference updates
    const oldPreferences = localMems.filter(
      m => m.memory_type === 'preference' && 
      new Date(m.updated_at) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    if (oldPreferences.length > 0) {
      insights.push({
        type: 'reminder',
        title: 'Update Your Preferences',
        description: 'Some of your preferences are over 90 days old',
        importance: 0.6,
        relatedMemories: oldPreferences.map(m => m.id),
      });
    }

    return insights;
  };

  useEffect(() => {
    generateInsights();
  }, []);

  return {
    insights,
    isLoading,
    refreshInsights: generateInsights,
  };
}

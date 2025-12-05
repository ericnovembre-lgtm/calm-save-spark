import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FinancialStory {
  id: string;
  type: 'high_five' | 'nudge' | 'milestone' | 'goal_win' | 'spending_alert' | 'streak';
  title: string;
  headline: string;
  body: string;
  theme: 'emerald' | 'rose' | 'amber' | 'gold' | 'violet' | 'cyan';
  animation: 'confetti' | 'shake' | 'sparkle' | 'trophy' | 'pulse' | 'counter';
  createdAt: string;
  expiresAt: string;
  data: {
    amount?: number;
    percentChange?: number;
    comparison?: string;
    metric?: string;
    goalName?: string;
    merchantName?: string;
  };
  cta?: {
    label: string;
    action: string;
  };
}

const VIEWED_STORIES_KEY = 'save_plus_viewed_stories';

export function useFinancialStories() {
  const { user } = useAuth();
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  // Load viewed stories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(VIEWED_STORIES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out old entries (older than 24 hours)
        const now = Date.now();
        const filtered = Object.entries(parsed)
          .filter(([_, timestamp]) => now - (timestamp as number) < 24 * 60 * 60 * 1000)
          .map(([id]) => id);
        setViewedStories(new Set(filtered));
      } catch {
        setViewedStories(new Set());
      }
    }
  }, []);

  // Fetch stories from edge function
  const { data: stories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['financial-stories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-financial-stories');
      if (error) throw error;
      
      // Filter expired stories
      const now = new Date();
      const validStories = (data?.stories || []).filter((story: FinancialStory) => 
        new Date(story.expiresAt) > now
      );
      
      return validStories as FinancialStory[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mark story as viewed
  const markAsViewed = useCallback((storyId: string) => {
    setViewedStories(prev => {
      const next = new Set(prev);
      next.add(storyId);
      
      // Persist to localStorage with timestamp
      const stored = localStorage.getItem(VIEWED_STORIES_KEY);
      const existing = stored ? JSON.parse(stored) : {};
      existing[storyId] = Date.now();
      localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(existing));
      
      return next;
    });
  }, []);

  // Check if story is viewed
  const isViewed = useCallback((storyId: string) => {
    return viewedStories.has(storyId);
  }, [viewedStories]);

  // Count unviewed stories
  const unviewedCount = stories.filter(s => !viewedStories.has(s.id)).length;

  // Get unviewed stories first, then viewed
  const sortedStories = [
    ...stories.filter(s => !viewedStories.has(s.id)),
    ...stories.filter(s => viewedStories.has(s.id))
  ];

  return {
    stories: sortedStories,
    isLoading,
    error,
    unviewedCount,
    markAsViewed,
    isViewed,
    refetch
  };
}

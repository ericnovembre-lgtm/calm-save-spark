import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseGoalVisualOptions {
  goalName: string;
  enabled?: boolean;
}

interface GoalVisual {
  imageUrl: string | null;
  prompt: string | null;
  isLoading: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

/**
 * Hook for AI-generated goal visuals
 * Automatically generates and caches images based on goal name
 */
export const useGoalVisual = ({ goalName, enabled = true }: UseGoalVisualOptions): GoalVisual => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVisual = async () => {
    if (!goalName || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📸 Generating visual for goal: "${goalName}"`);
      
      const { data, error: fnError } = await supabase.functions.invoke('generate-goal-visual', {
        body: { goalName }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw fnError;
      }

      console.log('✅ Visual generated:', { 
        cached: data.cached, 
        hasUrl: !!data.imageUrl,
        urlPreview: data.imageUrl?.substring(0, 50) 
      });

      setImageUrl(data.imageUrl);
      setPrompt(data.prompt);

      // Only show toast for newly generated images, not cached ones
      if (!data.cached) {
        toast.success('Goal visual generated! ✨');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate visual';
      console.error('❌ Failed to generate goal visual:', errorMsg, err);
      setError(errorMsg);
      
      // Don't show toast for every error - only for non-rate-limit errors
      if (!errorMsg.includes('Rate limit') && !errorMsg.includes('credits')) {
        toast.error('Could not generate goal visual');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      generateVisual();
    }
  }, [goalName, enabled]);

  const regenerate = async () => {
    // Clear cache by calling with force regenerate flag
    setImageUrl(null);
    await generateVisual();
  };

  return {
    imageUrl,
    prompt,
    isLoading,
    error,
    regenerate
  };
};

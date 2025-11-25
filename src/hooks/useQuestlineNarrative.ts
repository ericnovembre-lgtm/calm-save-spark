import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuestlineNarrative {
  narrative: string;
  encouragement: string;
  nextStepHint: string;
  progressMood: 'triumphant' | 'steady' | 'struggling';
}

interface UseQuestlineNarrativeParams {
  questlineId: string;
  category: string;
  progress?: {
    currentStep: number;
    stepsCompleted: number[];
    totalSteps: number;
  };
  userBehavior?: {
    recentTransactions?: number;
    savingsVelocity?: string;
  };
}

export function useQuestlineNarrative({
  questlineId,
  category,
  progress,
  userBehavior,
}: UseQuestlineNarrativeParams) {
  return useQuery<QuestlineNarrative>({
    queryKey: ['questline-narrative', questlineId, progress?.currentStep],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-quest-narrative', {
          body: {
            questlineId,
            category,
            progress,
            userBehavior,
          },
        });

        if (error) {
          console.error('Narrative generation error:', error);
          throw error;
        }

        return data as QuestlineNarrative;
      } catch (error) {
        console.error('Failed to fetch narrative:', error);
        // Return fallback
        return {
          narrative: "Your financial journey continues with each decision you make.",
          encouragement: "Keep moving forward!",
          nextStepHint: "Focus on your next milestone.",
          progressMood: 'steady' as const,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

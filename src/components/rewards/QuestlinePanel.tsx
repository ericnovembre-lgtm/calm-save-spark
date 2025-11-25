import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestlineCard } from "./QuestlineCard";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useQuestlineNarrative } from "@/hooks/useQuestlineNarrative";

export function QuestlinePanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: questlines, isLoading } = useQuery({
    queryKey: ['financial-questlines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_questlines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ['user-questline-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_questline_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !questlines || questlines.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No questlines available yet. Check back soon for new financial journeys!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Financial Questlines</h2>
          <p className="text-sm text-muted-foreground">
            Multi-step missions with narrative arcs and meaningful outcomes
          </p>
        </div>
      </div>

      {questlines.map((questline) => {
        const userProgress = progress?.find(p => p.questline_id === questline.id);
        const steps = questline.steps as any[];

        return (
          <QuestlineCardWithNarrative 
            key={questline.id}
            questline={questline}
            userProgress={userProgress}
            steps={steps}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        );
      })}
    </div>
  );
}

function QuestlineCardWithNarrative({ 
  questline, 
  userProgress, 
  steps, 
  expandedId, 
  setExpandedId 
}: {
  questline: any;
  userProgress: any;
  steps: any[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  const { data: narrative, isLoading: isNarrativeLoading } = useQuestlineNarrative({
    questlineId: questline.id,
    category: questline.category,
    progress: userProgress ? {
      currentStep: userProgress.current_step,
      stepsCompleted: userProgress.steps_completed as number[],
      totalSteps: steps.length,
    } : undefined,
    userBehavior: {
      recentTransactions: 5,
      savingsVelocity: 'moderate',
    },
  });

  return (
    <QuestlineCard
      name={questline.name}
      description={questline.description || undefined}
      narrativeIntro={questline.narrative_intro || undefined}
      aiNarrative={narrative}
      isNarrativeLoading={isNarrativeLoading}
      steps={steps}
      totalPoints={questline.total_points}
      category={questline.category}
      icon={questline.icon || undefined}
      progress={userProgress ? {
        currentStep: userProgress.current_step,
        stepsCompleted: userProgress.steps_completed as number[],
        completedAt: userProgress.completed_at || undefined,
      } : undefined}
      isExpanded={expandedId === questline.id}
      onToggle={() => setExpandedId(expandedId === questline.id ? null : questline.id)}
    />
  );
}

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

export function useQuestlineAutoProgress(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channels: RealtimeChannel[] = [];

    const checkQuestlineProgress = async (actionType: string, actionData: any) => {
      try {
        // Fetch user's active questlines
        const { data: progress } = await supabase
          .from('user_questline_progress')
          .select(`
            *,
            questline:financial_questlines(*)
          `)
          .eq('user_id', userId)
          .is('completed_at', null);

        if (!progress || progress.length === 0) return;

        for (const userProgress of progress) {
          const questline = userProgress.questline as any;
          if (!questline?.steps) continue;

          const steps = Array.isArray(questline.steps) ? questline.steps : [];
          const currentStep = steps.find((s: any) => s.step === userProgress.current_step);
          
          if (!currentStep) continue;

          // Check if action matches step requirement
          let shouldAdvance = false;
          const requirement = currentStep.requirement || {};

          switch (actionType) {
            case 'payment':
              if (requirement.type === 'payment') {
                // Check payment count from transactions
                const { count } = await supabase
                  .from('transactions')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', userId)
                  .gte('amount', 0);

                if (count && count >= (requirement.count || 1)) {
                  shouldAdvance = true;
                }
              }
              break;

            case 'savings':
              if (requirement.type === 'savings' || requirement.type === 'goal_contribution') {
                // Check goal contributions
                const { data: goals } = await supabase
                  .from('goals')
                  .select('*')
                  .eq('user_id', userId)
                  .gt('current_amount', 0);

                if (goals && goals.length >= (requirement.count || 1)) {
                  shouldAdvance = true;
                }
              }
              break;

            case 'budget':
              if (requirement.type === 'budget' || requirement.type === 'utilization') {
                // Check budget spending patterns
                const { data: spending } = await supabase
                  .from('budget_spending')
                  .select('*')
                  .eq('user_id', userId);

                if (spending && spending.length > 0) {
                  shouldAdvance = true;
                }
              }
              break;
          }

          if (shouldAdvance) {
            // Advance to next step
            const stepsCompleted = Array.isArray(userProgress.steps_completed) 
              ? [...userProgress.steps_completed, userProgress.current_step]
              : [userProgress.current_step];

            const isQuestlineComplete = userProgress.current_step >= steps.length;

            await supabase
              .from('user_questline_progress')
              .update({
                current_step: isQuestlineComplete ? userProgress.current_step : userProgress.current_step + 1,
                steps_completed: stepsCompleted,
                completed_at: isQuestlineComplete ? new Date().toISOString() : null
              })
              .eq('id', userProgress.id);

            // Emit celebration event for UI
            window.dispatchEvent(new CustomEvent('questline-chapter-complete', {
              detail: {
                stepTitle: currentStep.title,
                stepPoints: currentStep.points,
                questlineName: questline.name,
                category: questline.category || 'general',
                isQuestlineComplete,
              }
            }));

            // Show toast notification
            if (isQuestlineComplete) {
              toast.success('🎊 Questline Complete!', {
                description: `You've completed "${questline.name}"! Earned ${questline.total_points} points.`,
                duration: 10000
              });
            } else {
              toast.success('📖 Quest Progress!', {
                description: `${currentStep.title} complete! Next: ${steps[userProgress.current_step]?.title || 'Final step'}`,
                duration: 6000
              });
            }

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['questline-progress', userId] });
          }
        }
      } catch (error) {
        console.error('Questline progress check error:', error);
      }
    };

    // Subscribe to transactions (for payments)
    const transactionChannel = supabase
      .channel('questline-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Transaction for questline:', payload);
          checkQuestlineProgress('payment', payload.new);
        }
      )
      .subscribe();

    channels.push(transactionChannel);

    // Subscribe to goals (for savings)
    const goalChannel = supabase
      .channel('questline-goals')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Goal update for questline:', payload);
          checkQuestlineProgress('savings', payload.new);
        }
      )
      .subscribe();

    channels.push(goalChannel);

    // Subscribe to budget spending (for budget-related quests)
    const budgetChannel = supabase
      .channel('questline-budget')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_spending',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Budget update for questline:', payload);
          checkQuestlineProgress('budget', payload.new);
        }
      )
      .subscribe();

    channels.push(budgetChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, queryClient]);
}

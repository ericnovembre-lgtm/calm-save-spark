import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface MilestoneData {
  debtId: string;
  debtName: string;
  percentage: 25 | 50 | 75 | 100;
  currentBalance: number;
  originalBalance: number;
}

export function useDebtMilestones(debts: Debt[]) {
  const [celebrateMilestone, setCelebrateMilestone] = useState<MilestoneData | null>(null);
  const previousBalances = useRef<Map<string, number>>(new Map());
  const triggeredMilestones = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkMilestones = async () => {
      for (const debt of debts) {
        const originalBalance = debt.original_balance;
        const currentBalance = debt.current_balance;
        const previousBalance = previousBalances.current.get(debt.id);

        if (!previousBalance || previousBalance === currentBalance || originalBalance === 0) {
          previousBalances.current.set(debt.id, currentBalance);
          continue;
        }

        const previousProgress = ((originalBalance - previousBalance) / originalBalance) * 100;
        const currentProgress = ((originalBalance - currentBalance) / originalBalance) * 100;

        const milestones = [25, 50, 75, 100];
        
        for (const milestone of milestones) {
          const milestoneKey = `${debt.id}-${milestone}`;
          
          if (
            previousProgress < milestone && 
            currentProgress >= milestone &&
            !triggeredMilestones.current.has(milestoneKey)
          ) {
            triggeredMilestones.current.add(milestoneKey);
            
            setCelebrateMilestone({
              debtId: debt.id,
              debtName: debt.debt_name,
              percentage: milestone as 25 | 50 | 75 | 100,
              currentBalance,
              originalBalance
            });

            // Store milestone achievement
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('milestones_reached')
                .eq('id', user.id)
                .single();

              const existingMilestones = (profile?.milestones_reached as any) || {};
              const debtMilestones = existingMilestones.debts || [];
              
              await supabase
                .from('profiles')
                .update({
                  milestones_reached: {
                    ...existingMilestones,
                    debts: [
                      ...debtMilestones,
                      { debtId: debt.id, milestone, date: new Date().toISOString() }
                    ]
                  }
                })
                .eq('id', user.id);
            }

            break;
          }
        }

        previousBalances.current.set(debt.id, currentBalance);
      }
    };

    checkMilestones();
  }, [debts]);

  const dismissMilestone = () => {
    setCelebrateMilestone(null);
  };

  return {
    milestone: celebrateMilestone,
    dismissMilestone
  };
}

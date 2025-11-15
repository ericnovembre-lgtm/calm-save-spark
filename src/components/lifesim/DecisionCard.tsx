import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, TrendingUp, Home, Briefcase } from 'lucide-react';

interface DecisionCardProps {
  session: any;
}

const DECISION_SCENARIOS = [
  {
    id: 'emergency_fund',
    category: 'investment',
    title: 'Build Emergency Fund',
    description: 'You have an opportunity to save more aggressively for emergencies',
    choices: [
      { id: 'save_3months', label: 'Save 3 months expenses', impact: { capital: -15000, security: +2 } },
      { id: 'save_6months', label: 'Save 6 months expenses', impact: { capital: -30000, security: +4 } },
      { id: 'skip', label: 'Skip for now', impact: { capital: 0, security: 0 } },
    ],
    riskLevel: 'low',
  },
  {
    id: 'stock_market',
    category: 'investment',
    title: 'Stock Market Investment',
    description: 'The market is showing strong performance. How much to invest?',
    choices: [
      { id: 'conservative', label: 'Invest 10% of savings', impact: { capital: -5000, investments: +5500 } },
      { id: 'moderate', label: 'Invest 25% of savings', impact: { capital: -12500, investments: +14000 } },
      { id: 'aggressive', label: 'Invest 50% of savings', impact: { capital: -25000, investments: +30000 } },
    ],
    riskLevel: 'high',
  },
  {
    id: 'side_hustle',
    category: 'career',
    title: 'Side Hustle Opportunity',
    description: 'You could start a side business for extra income',
    choices: [
      { id: 'start', label: 'Start side hustle (-$2k investment)', impact: { capital: -2000, income: +12000 } },
      { id: 'wait', label: 'Wait and save more', impact: { capital: 0, income: 0 } },
    ],
    riskLevel: 'medium',
  },
];

export function DecisionCard({ session }: DecisionCardProps) {
  const queryClient = useQueryClient();
  const [currentDecision] = useState(DECISION_SCENARIOS[Math.floor(Math.random() * DECISION_SCENARIOS.length)]);

  const makeDecision = useMutation({
    mutationFn: async (choice: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Record decision
      const { error: decisionError } = await supabase
        .from('lifesim_player_decisions')
        .insert({
          session_id: session.id,
          decision_type: currentDecision.id,
          decision_data: {
            category: currentDecision.category,
            choice_made: choice.id,
            alternatives: currentDecision.choices,
            immediate_impact: choice.impact,
          },
          game_year: Math.floor((session.current_age - 22) / 1),
          financial_impact: choice.impact,
          risk_score: currentDecision.riskLevel === 'high' ? 0.8 : currentDecision.riskLevel === 'medium' ? 0.5 : 0.2,
        });

      if (decisionError) throw decisionError;

      // Update session
      const newCapital = Number(session.current_capital) + (choice.impact.capital || 0) + (choice.impact.investments || 0);
      const newIncome = Number(session.current_income) + (choice.impact.income || 0);

      const { error: updateError } = await supabase
        .from('lifesim_game_sessions')
        .update({
          financial_state: {
            cash: newCapital,
            income: newIncome,
            debt: session.current_debt || 0,
            investments: choice.impact.investments || 0,
          },
          current_age: session.current_age + 1,
          current_year: session.current_year + 1,
          score: (session.score || 0) + 10,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifesim-session'] });
      queryClient.invalidateQueries({ queryKey: ['lifesim-player-decisions'] });
      toast.success('Decision made! Life continues...');
    },
    onError: () => {
      toast.error('Failed to process decision');
    },
  });

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-500/10 text-green-600 border-green-500/20',
      medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      high: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return colors[risk as keyof typeof colors] || colors.medium;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{currentDecision.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{currentDecision.description}</p>
        </div>
        <Badge className={getRiskBadge(currentDecision.riskLevel)}>
          {currentDecision.riskLevel} risk
        </Badge>
      </div>

      <div className="space-y-3">
        {currentDecision.choices.map((choice) => (
          <Button
            key={choice.id}
            variant="outline"
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => makeDecision.mutate(choice)}
            disabled={makeDecision.isPending}
          >
            <div className="flex-1">
              <p className="font-medium">{choice.label}</p>
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                {choice.impact.capital !== undefined && (
                  <span className={choice.impact.capital >= 0 ? 'text-green-600' : 'text-red-600'}>
                    Capital: {choice.impact.capital >= 0 ? '+' : ''}${Math.abs(choice.impact.capital).toLocaleString()}
                  </span>
                )}
                {choice.impact.income !== undefined && choice.impact.income !== 0 && (
                  <span className="text-blue-600">
                    Income: +${choice.impact.income.toLocaleString()}/yr
                  </span>
                )}
                {choice.impact.investments !== undefined && (
                  <span className="text-purple-600">
                    Invested: ${choice.impact.investments.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          Decisions impact your financial trajectory and feed into your Digital Twin profile
        </p>
      </div>
    </Card>
  );
}

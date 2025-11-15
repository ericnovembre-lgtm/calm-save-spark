import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OpportunityCardProps {
  opportunity: any;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const queryClient = useQueryClient();

  const updateOpportunity = useMutation({
    mutationFn: async (decision: 'accepted' | 'rejected') => {
      const { error } = await supabase
        .from('refinancing_opportunities')
        .update({
          user_decision: decision,
          user_decision_at: new Date().toISOString(),
          status: decision === 'accepted' ? 'approved' : 'rejected',
        })
        .eq('id', opportunity.id);

      if (error) throw error;
    },
    onSuccess: (_, decision) => {
      queryClient.invalidateQueries({ queryKey: ['refinancing-opportunities'] });
      toast.success(decision === 'accepted' ? 'Refinancing approved!' : 'Opportunity dismissed');
    },
  });

  const currentRate = Number(opportunity.current_rate) * 100;
  const availableRate = Number(opportunity.available_rate) * 100;
  const rateDiff = currentRate - availableRate;
  const netSavings = Number(opportunity.net_savings);
  const breakEven = opportunity.break_even_months;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold capitalize">{opportunity.loan_type} Refinancing</h3>
            <Badge className="bg-green-500/10 text-green-600">
              -{rateDiff.toFixed(2)}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {opportunity.lender_name || 'Multiple Lenders Available'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
        <div>
          <p className="text-sm text-muted-foreground">Current Rate</p>
          <p className="text-2xl font-bold">{currentRate.toFixed(2)}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            ${Number(opportunity.current_monthly_payment).toLocaleString()}/mo
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">New Rate</p>
          <p className="text-2xl font-bold text-green-600">{availableRate.toFixed(2)}%</p>
          <p className="text-sm text-green-600 mt-1">
            ${Number(opportunity.projected_monthly_payment).toLocaleString()}/mo
          </p>
        </div>
      </div>

      <div className="pt-4 border-t space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Net Savings
          </span>
          <span className="font-bold text-green-600 text-lg">
            ${netSavings.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Break-even Period
          </span>
          <span className="font-semibold">
            {breakEven} months
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Monthly Savings
          </span>
          <span className="font-semibold text-green-600">
            ${(Number(opportunity.current_monthly_payment) - Number(opportunity.projected_monthly_payment)).toLocaleString()}/mo
          </span>
        </div>
      </div>

      {opportunity.closing_costs > 0 && (
        <div className="p-3 bg-accent/50 rounded-lg text-sm">
          <p className="text-muted-foreground">
            Estimated Closing Costs: <span className="font-semibold">${Number(opportunity.closing_costs).toLocaleString()}</span>
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 gap-2"
          onClick={() => updateOpportunity.mutate('rejected')}
          disabled={updateOpportunity.isPending}
        >
          <XCircle className="w-4 h-4" />
          Dismiss
        </Button>
        <Button 
          className="flex-1 gap-2"
          onClick={() => updateOpportunity.mutate('accepted')}
          disabled={updateOpportunity.isPending}
        >
          <CheckCircle2 className="w-4 h-4" />
          Start Refinancing
        </Button>
      </div>
    </Card>
  );
}

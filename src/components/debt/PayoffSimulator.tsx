import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Zap, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DebtPayoffChart } from '@/components/debt/DebtPayoffChart';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface PayoffSimulatorProps {
  debts: Debt[];
  userId?: string;
}

export default function PayoffSimulator({ debts }: PayoffSimulatorProps) {
  const [extraPayment, setExtraPayment] = useState(0);

  const { data: avalancheData, isLoading: avalancheLoading } = useQuery({
    queryKey: ['debt_simulation', 'avalanche', extraPayment],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debt-payoff-simulator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ strategy: 'avalanche', extraPayment })
        }
      );

      if (!response.ok) throw new Error('Simulation failed');
      return response.json();
    },
    enabled: debts.length > 0
  });

  const { data: snowballData, isLoading: snowballLoading } = useQuery({
    queryKey: ['debt_simulation', 'snowball', extraPayment],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debt-payoff-simulator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ strategy: 'snowball', extraPayment })
        }
      );

      if (!response.ok) throw new Error('Simulation failed');
      return response.json();
    },
    enabled: debts.length > 0
  });

  if (debts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Add debts to see payoff simulations</p>
      </Card>
    );
  }

  const isLoading = avalancheLoading || snowballLoading;

  return (
    <div className="space-y-6">
      {/* Extra Payment Slider */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
            <span className="text-2xl font-bold text-primary">${extraPayment}</span>
          </div>
          <Slider
            id="extra-payment"
            value={[extraPayment]}
            onValueChange={(v) => setExtraPayment(v[0])}
            max={1000}
            step={25}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Adjust to see how extra payments accelerate your debt-free date
          </p>
        </div>
      </Card>

      {/* Strategy Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Avalanche Strategy */}
        <Card className="p-6 border-2 border-primary/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Avalanche Method</h3>
                <p className="text-sm text-muted-foreground">Highest interest first</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
              </div>
            ) : avalancheData?.summary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time to Freedom</span>
                  </div>
                  <span className="text-xl font-bold">{avalancheData.summary.years_to_payoff} years</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Interest</span>
                  </div>
                  <span className="text-xl font-bold text-destructive">
                    ${avalancheData.summary.total_interest_paid?.toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                  </div>
                  <span className="text-xl font-bold">
                    ${avalancheData.summary.total_paid?.toFixed(2) || '0'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Snowball Strategy */}
        <Card className="p-6 border-2 border-secondary/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary/10">
                <TrendingDown className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Snowball Method</h3>
                <p className="text-sm text-muted-foreground">Smallest balance first</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
              </div>
            ) : snowballData?.summary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time to Freedom</span>
                  </div>
                  <span className="text-xl font-bold">{snowballData.summary.years_to_payoff} years</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Interest</span>
                  </div>
                  <span className="text-xl font-bold text-destructive">
                    ${snowballData.summary.total_interest_paid?.toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                  </div>
                  <span className="text-xl font-bold">
                    ${snowballData.summary.total_paid?.toFixed(2) || '0'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Charts */}
      {!isLoading && avalancheData?.simulation && (
        <DebtPayoffChart simulation={avalancheData.simulation} strategy="avalanche" />
      )}
    </div>
  );
}

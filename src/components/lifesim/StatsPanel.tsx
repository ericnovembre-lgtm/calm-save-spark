import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

interface StatsPanelProps {
  sessionId: string;
}

export function StatsPanel({ sessionId }: StatsPanelProps) {
  const { data: turns, isLoading } = useQuery({
    queryKey: ['lifesim-turns', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lifesim_turns')
        .select('*')
        .eq('session_id', sessionId)
        .order('turn_number');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: decisions } = useQuery({
    queryKey: ['lifesim-decisions', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lifesim_decisions')
        .select('*')
        .eq('session_id', sessionId)
        .order('turn_number');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  const chartData = turns?.map(turn => ({
    age: turn.age,
    netWorth: Number(turn.net_worth),
    income: Number(turn.income),
    debt: Number(turn.debt),
    investments: Number(turn.investments),
  })) || [];

  const categoryBreakdown = decisions?.reduce((acc: any, d) => {
    acc[d.decision_category] = (acc[d.decision_category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Net Worth Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="netWorth" stroke="#8b5cf6" name="Net Worth" strokeWidth={2} />
            <Line type="monotone" dataKey="investments" stroke="#10b981" name="Investments" strokeWidth={2} />
            <Line type="monotone" dataKey="debt" stroke="#ef4444" name="Debt" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Decision Breakdown</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(categoryBreakdown || {}).map(([category, count]) => (
            <div key={category} className="text-center p-4 bg-accent/50 rounded-lg">
              <p className="text-2xl font-bold">{count as number}</p>
              <p className="text-sm text-muted-foreground capitalize">{category}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Decisions</h3>
        <div className="space-y-3">
          {decisions?.slice(-5).reverse().map((decision) => (
            <div key={decision.id} className="p-4 bg-accent/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{decision.decision_type.replace('_', ' ')}</span>
                <span className="text-sm text-muted-foreground">Turn {decision.turn_number}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Category: <span className="capitalize">{decision.decision_category}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

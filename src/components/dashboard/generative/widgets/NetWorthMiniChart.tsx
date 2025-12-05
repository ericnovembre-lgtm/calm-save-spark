import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface NetWorthMiniChartProps {
  userId?: string;
}

const NetWorthMiniChart = ({ userId }: NetWorthMiniChartProps) => {
  // Use financial_health_history as proxy for net worth tracking
  const { data: history } = useQuery({
    queryKey: ['financial-health-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('financial_health_history')
        .select('score, calculated_at')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: true })
        .limit(30);
      return data || [];
    },
    enabled: !!userId
  });

  // Also get current balance from pots + goals as rough net worth
  const { data: savingsData } = useQuery({
    queryKey: ['total-savings', userId],
    queryFn: async () => {
      if (!userId) return { pots: 0, goals: 0 };
      const [potsRes, goalsRes] = await Promise.all([
        supabase.from('pots').select('current_amount').eq('user_id', userId).eq('is_active', true),
        supabase.from('goals').select('current_amount').eq('user_id', userId).eq('is_active', true)
      ]);
      const potsTotal = potsRes.data?.reduce((sum, p) => sum + Number(p.current_amount || 0), 0) || 0;
      const goalsTotal = goalsRes.data?.reduce((sum, g) => sum + Number(g.current_amount || 0), 0) || 0;
      return { pots: potsTotal, goals: goalsTotal };
    },
    enabled: !!userId
  });

  const currentNetWorth = (savingsData?.pots || 0) + (savingsData?.goals || 0);
  
  const chartData = history?.map(h => ({
    date: h.calculated_at,
    value: Number(h.score) || 0
  })) || [];

  const currentScore = chartData[chartData.length - 1]?.value || 0;
  const previousScore = chartData[chartData.length - 2]?.value || currentScore;
  const change = currentScore - previousScore;
  const isPositive = change >= 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Net Worth
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">
          ${currentNetWorth.toLocaleString()}
        </div>
        <div className={`text-xs ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          Health score: {currentScore}/100
        </div>
        {chartData.length > 1 && (
          <div className="h-16 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  fill="url(#netWorthGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetWorthMiniChart;

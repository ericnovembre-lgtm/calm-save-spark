import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from '@/components/charts/LazyLineChart';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/LoadingState';

interface PerformanceChartProps {
  userId: string;
}

export function PerformanceChart({ userId }: PerformanceChartProps) {
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio-snapshots', userId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('total_value, snapshot_date')
        .eq('user_id', userId)
        .gte('snapshot_date', thirtyDaysAgo.toISOString())
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: benchmarkData, isLoading: benchmarkLoading } = useQuery({
    queryKey: ['benchmark-data'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('benchmark_data')
        .select('value, date')
        .eq('benchmark_name', 'SP500')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (portfolioLoading || benchmarkLoading) {
    return <LoadingState />;
  }

  // Normalize both datasets to percentage change from start
  const normalizeData = (data: any[], valueKey: string) => {
    if (!data || data.length === 0) return [];
    const startValue = parseFloat(String(data[0][valueKey]));
    return data.map(item => ({
      ...item,
      normalizedValue: ((parseFloat(String(item[valueKey])) - startValue) / startValue) * 100
    }));
  };

  const normalizedPortfolio = normalizeData(portfolioData || [], 'total_value');
  const normalizedBenchmark = normalizeData(benchmarkData || [], 'value');

  // Merge datasets by date
  const mergedData = normalizedPortfolio.map(p => {
    const date = new Date(p.snapshot_date).toISOString().split('T')[0];
    const benchmark = normalizedBenchmark.find(b => b.date === date);
    return {
      date: new Date(p.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      portfolio: p.normalizedValue.toFixed(2),
      benchmark: benchmark ? benchmark.normalizedValue.toFixed(2) : null
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Performance vs S&P 500 (30 Days)
      </h3>
      <LazyLineChart height={300} data={mergedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: any) => `${value}%`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="portfolio" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          name="Your Portfolio"
        />
        <Line 
          type="monotone" 
          dataKey="benchmark" 
          stroke="hsl(var(--muted-foreground))" 
          strokeWidth={2}
          strokeDasharray="5 5"
          name="S&P 500"
        />
      </LazyLineChart>
    </Card>
  );
}
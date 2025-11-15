import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface ComparisonViewProps {
  scenarioIds: string[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export function ComparisonView({ scenarioIds }: ComparisonViewProps) {
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['compare-scenarios', scenarioIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twin_scenarios')
        .select('*')
        .in('id', scenarioIds);
      
      if (error) throw error;
      return data;
    },
    enabled: scenarioIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return null;
  }

  // Merge timeline data
  const mergedData: any[] = [];
  const maxLength = Math.max(...scenarios.map(s => (s.projected_outcomes as any[])?.length || 0));

  for (let i = 0; i < maxLength; i++) {
    const dataPoint: any = { year: null };
    scenarios.forEach((scenario, idx) => {
      const outcomes = scenario.projected_outcomes as any[];
      if (outcomes && outcomes[i]) {
        dataPoint.year = outcomes[i].year;
        dataPoint[`scenario${idx}`] = outcomes[i].median;
      }
    });
    if (dataPoint.year) {
      mergedData.push(dataPoint);
    }
  }

  return (
    <div className="space-y-6">
      {/* Comparison Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scenario Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="year" 
              className="text-xs"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              className="text-xs"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{ value: 'Net Worth', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {scenarios.map((scenario, idx) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={`scenario${idx}`}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                name={scenario.scenario_name || `Scenario ${idx + 1}`}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Success Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Success Rate Comparison</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, idx) => (
            <div key={scenario.id} className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">{scenario.scenario_name}</div>
              <div 
                className={`text-2xl font-bold ${
                  (scenario.success_probability || 0) >= 75 ? 'text-success' :
                  (scenario.success_probability || 0) >= 50 ? 'text-warning' :
                  'text-destructive'
                }`}
                style={{ color: COLORS[idx % COLORS.length] }}
              >
                {scenario.success_probability}%
              </div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">
                {scenario.scenario_type?.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

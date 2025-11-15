import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle } from "lucide-react";

interface ScenarioComparisonProps {
  lifePlanId: string;
}

export function ScenarioComparison({ lifePlanId }: ScenarioComparisonProps) {
  const { data: scenarios } = useQuery({
    queryKey: ["scenarios", lifePlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_event_scenarios")
        .select("*")
        .eq("life_plan_id", lifePlanId);

      if (error) throw error;
      return data;
    }
  });

  if (!scenarios || scenarios.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No scenarios available for comparison</p>
      </Card>
    );
  }

  const chartData = scenarios.map(s => {
    const outcomes = s.projected_outcomes as any;
    return {
      name: s.scenario_name,
      cost: outcomes?.total_cost || 0,
      savings: outcomes?.monthly_savings_needed || 0
    };
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Cost Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cost" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(scenario => {
          const outcomes = scenario.projected_outcomes as any;
          const params = scenario.parameters as any;
          
          return (
            <Card key={scenario.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{scenario.scenario_name}</h3>
                  {scenario.is_selected && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                {scenario.description && (
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-medium text-foreground">
                      ${(outcomes?.total_cost || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Savings</span>
                    <span className="font-medium text-foreground">
                      ${(outcomes?.monthly_savings_needed || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline</span>
                    <span className="font-medium text-foreground">
                      {outcomes?.timeline_months || params?.timeline_months || 'N/A'} months
                    </span>
                  </div>
                </div>

                {outcomes?.pros_cons && (
                  <div className="pt-4 border-t border-border text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="text-green-500 font-medium">Pros:</span>
                        <p className="text-muted-foreground mt-1">
                          {outcomes.pros_cons.pros}
                        </p>
                      </div>
                      <div>
                        <span className="text-red-500 font-medium">Cons:</span>
                        <p className="text-muted-foreground mt-1">
                          {outcomes.pros_cons.cons}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  variant={scenario.is_selected ? "secondary" : "default"}
                  disabled={scenario.is_selected}
                >
                  {scenario.is_selected ? "Selected" : "Select Scenario"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

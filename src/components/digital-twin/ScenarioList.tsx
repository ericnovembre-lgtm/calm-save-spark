import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ScenarioListProps {
  selectedScenarios: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function ScenarioList({ selectedScenarios, onSelectionChange }: ScenarioListProps) {
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['twin-scenarios'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('twin_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleToggle = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      onSelectionChange(selectedScenarios.filter(id => id !== scenarioId));
    } else {
      onSelectionChange([...selectedScenarios, scenarioId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No scenarios yet. Create your first scenario in the Builder tab!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="p-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={selectedScenarios.includes(scenario.id)}
              onCheckedChange={() => handleToggle(scenario.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{scenario.scenario_name}</h4>
                <Badge variant="outline" className="capitalize">
                  {scenario.scenario_type?.replace('_', ' ')}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className={`ml-2 font-semibold ${
                    (scenario.success_probability || 0) >= 75 ? 'text-success' :
                    (scenario.success_probability || 0) >= 50 ? 'text-warning' :
                    'text-destructive'
                  }`}>
                    {scenario.success_probability}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Simulations:</span>
                  <span className="ml-2 font-semibold">{scenario.monte_carlo_runs}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(scenario.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";
import { MonteCarloChart } from "./MonteCarloChart";

export function ScenarioBuilder() {
  const queryClient = useQueryClient();
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioType, setScenarioType] = useState("custom");
  const [parameters, setParameters] = useState({
    yearsToProject: 30,
    targetNetWorth: 1000000,
    salaryGrowth: 0.03,
    changeYear: 5,
    newIncome: 0,
    downPayment: 0,
    mortgagePayment: 0,
    purchaseYear: 2,
  });
  const [results, setResults] = useState<any>(null);

  const { data: profile } = useQuery({
    queryKey: ['digital-twin-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('digital_twin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const runSimulation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('digital-twin-simulate', {
        body: {
          parameters: {
            ...parameters,
            scenarioType,
            name: scenarioName || 'Untitled Scenario',
          },
          monteCarloRuns: 1000,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResults(data);
      queryClient.invalidateQueries({ queryKey: ['twin-scenarios'] });
      toast.success('Simulation complete!');
    },
    onError: (error) => {
      console.error('Error running simulation:', error);
      toast.error('Failed to run simulation');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="scenarioName">Scenario Name</Label>
        <Input
          id="scenarioName"
          placeholder="e.g., Buy a House in 5 Years"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="scenarioType">Scenario Type</Label>
        <Select value={scenarioType} onValueChange={setScenarioType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="career_change">Career Change</SelectItem>
            <SelectItem value="buy_home">Buy a Home</SelectItem>
            <SelectItem value="early_retirement">Early Retirement</SelectItem>
            <SelectItem value="start_business">Start a Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Years to Project: {parameters.yearsToProject}</Label>
        <Slider
          value={[parameters.yearsToProject]}
          onValueChange={([value]) => setParameters({ ...parameters, yearsToProject: value })}
          min={5}
          max={50}
          step={5}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="targetNetWorth">Target Net Worth</Label>
        <Input
          id="targetNetWorth"
          type="number"
          value={parameters.targetNetWorth}
          onChange={(e) => setParameters({ ...parameters, targetNetWorth: parseFloat(e.target.value) })}
          step={10000}
        />
      </div>

      {scenarioType === 'career_change' && (
        <>
          <div>
            <Label>Career Change Year: {parameters.changeYear}</Label>
            <Slider
              value={[parameters.changeYear]}
              onValueChange={([value]) => setParameters({ ...parameters, changeYear: value })}
              min={1}
              max={20}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="newIncome">New Annual Income</Label>
            <Input
              id="newIncome"
              type="number"
              value={parameters.newIncome}
              onChange={(e) => setParameters({ ...parameters, newIncome: parseFloat(e.target.value) })}
              step={1000}
            />
          </div>
        </>
      )}

      {scenarioType === 'buy_home' && (
        <>
          <div>
            <Label>Purchase Year: {parameters.purchaseYear}</Label>
            <Slider
              value={[parameters.purchaseYear]}
              onValueChange={([value]) => setParameters({ ...parameters, purchaseYear: value })}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="downPayment">Down Payment</Label>
            <Input
              id="downPayment"
              type="number"
              value={parameters.downPayment}
              onChange={(e) => setParameters({ ...parameters, downPayment: parseFloat(e.target.value) })}
              step={1000}
            />
          </div>
          <div>
            <Label htmlFor="mortgagePayment">Monthly Mortgage Payment</Label>
            <Input
              id="mortgagePayment"
              type="number"
              value={parameters.mortgagePayment}
              onChange={(e) => setParameters({ ...parameters, mortgagePayment: parseFloat(e.target.value) })}
              step={100}
            />
          </div>
        </>
      )}

      <Button
        onClick={() => runSimulation.mutate()}
        disabled={runSimulation.isPending || !profile}
        className="w-full"
      >
        {runSimulation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running 1,000 Simulations...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Run Monte Carlo Simulation
          </>
        )}
      </Button>

      {results && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Success Probability</div>
              <div className={`text-2xl font-bold mt-1 ${
                results.results.successProbability >= 75 ? 'text-success' :
                results.results.successProbability >= 50 ? 'text-warning' :
                'text-destructive'
              }`}>
                {results.results.successProbability.toFixed(1)}%
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Median Outcome</div>
              <div className="text-2xl font-bold mt-1">
                ${results.results.percentiles.p50.toLocaleString()}
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Best Case (90th)</div>
              <div className="text-2xl font-bold mt-1 text-success">
                ${results.results.percentiles.p90.toLocaleString()}
              </div>
            </div>
          </div>

          <MonteCarloChart timeline={results.results.timeline} />
        </div>
      )}
    </div>
  );
}

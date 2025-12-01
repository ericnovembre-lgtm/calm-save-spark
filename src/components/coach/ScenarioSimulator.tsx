import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TimelineProjectionChart } from "./TimelineProjectionChart";

interface ScenarioSimulatorProps {
  userId: string;
}

const PRESET_SCENARIOS = [
  { label: "Car Purchase", prompt: "What if I buy a $30k car next month?" },
  { label: "Job Loss", prompt: "What if I lose my job?" },
  { label: "Extra Savings", prompt: "What if I save an extra $500 per month?" },
  { label: "Move", prompt: "What if I move to a new city?" },
];

export function ScenarioSimulator({ userId }: ScenarioSimulatorProps) {
  const [input, setInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async (prompt?: string) => {
    const scenario = prompt || input;
    if (!scenario.trim()) {
      toast.error("Please enter a scenario");
      return;
    }

    setIsSimulating(true);
    try {
      // Interpret the scenario
      const { data: interpretation, error: interpretError } = await supabase.functions.invoke(
        "interpret-scenario",
        { body: { scenario } }
      );

      if (interpretError) throw interpretError;

      // Simulate the scenario
      const { data: simulation, error: simError } = await supabase.functions.invoke(
        "digital-twin-simulate",
        {
          body: {
            userId,
            scenarioType: interpretation.type,
            parameters: interpretation.parameters,
          },
        }
      );

      if (simError) throw simError;

      setResult({
        scenarioName: interpretation.name || scenario,
        scenarioDate: interpretation.eventDate,
        currentPath: simulation.baseline,
        simulatedPath: simulation.scenario,
      });

      toast.success("Scenario simulated successfully");
    } catch (error: any) {
      console.error("Simulation error:", error);
      toast.error(error.message || "Failed to simulate scenario");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-command-surface border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-command-violet" />
          <h3 className="text-lg font-semibold text-white font-mono">
            Scenario Simulator
          </h3>
        </div>

        {/* What If Command Bar */}
        <div className="flex gap-2 mb-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSimulating) {
                handleSimulate();
              }
            }}
            placeholder="What if I buy a $30k car next month?"
            className="flex-1 bg-command-bg border-white/10 text-white font-mono placeholder:text-white/40"
            disabled={isSimulating}
          />
          <Button
            onClick={() => handleSimulate()}
            disabled={isSimulating || !input.trim()}
            className="bg-command-violet hover:bg-command-violet/80 text-white font-mono"
          >
            {isSimulating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Simulate"
            )}
          </Button>
        </div>

        {/* Preset Scenario Chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((scenario) => (
            <Button
              key={scenario.label}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(scenario.prompt);
                handleSimulate(scenario.prompt);
              }}
              disabled={isSimulating}
              className="text-xs font-mono border-white/10 hover:border-command-violet/50 hover:bg-command-violet/10"
            >
              {scenario.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline Projection Chart */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TimelineProjectionChart
            currentPath={result.currentPath}
            simulatedPath={result.simulatedPath}
            scenarioName={result.scenarioName}
            scenarioDate={result.scenarioDate}
          />
        </motion.div>
      )}
    </div>
  );
}

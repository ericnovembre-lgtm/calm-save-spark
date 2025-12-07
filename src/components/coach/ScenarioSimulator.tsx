import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Mic, Square, Save, History, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TimelineProjectionChart } from "./TimelineProjectionChart";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { cn } from "@/lib/utils";
import { coachSounds } from "@/lib/coach-sounds";
import { useScenarioHistory } from "@/hooks/useScenarioHistory";

interface ScenarioSimulatorProps {
  userId: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onOpenHistory?: () => void;
  onToggleCompare?: () => void;
  isCompareMode?: boolean;
}

const PRESET_SCENARIOS = [
  { label: "Car Purchase", prompt: "What if I buy a $30k car next month?" },
  { label: "Job Loss", prompt: "What if I lose my job?" },
  { label: "Extra Savings", prompt: "What if I save an extra $500 per month?" },
  { label: "Move", prompt: "What if I move to a new city?" },
];

export const ScenarioSimulator = forwardRef<HTMLInputElement, ScenarioSimulatorProps>(
  ({ userId, inputRef: externalRef, onOpenHistory, onToggleCompare, isCompareMode }, _ref) => {
    const [input, setInput] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [lastSimulation, setLastSimulation] = useState<any>(null);
    const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecording();
    const [isTranscribing, setIsTranscribing] = useState(false);
    const { saveScenario, isSaving } = useScenarioHistory();

    const handleVoiceStart = async () => {
      try {
        await startRecording();
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    };

    const handleVoiceStop = async () => {
      try {
        setIsTranscribing(true);
        const base64Audio = await stopRecording();

        const { data, error } = await supabase.functions.invoke("voice-to-text", {
          body: { audio: base64Audio },
        });

        if (error) throw error;

        if (data?.text) {
          setInput(data.text);
          toast.success("Voice captured! Click Simulate or press Enter.");
        }
      } catch (error: any) {
        console.error("Transcription error:", error);
        toast.error("Failed to transcribe audio");
      } finally {
        setIsTranscribing(false);
      }
    };

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

        const resultData = {
          scenarioName: interpretation.name || scenario,
          scenarioDate: interpretation.eventDate,
          currentPath: simulation.baseline,
          simulatedPath: simulation.scenario,
          confidence: simulation.confidence,
          metadata: simulation.metadata,
        };

        setResult(resultData);
        setLastSimulation({
          data: simulation,
          parameters: interpretation,
          input: scenario,
        });

        // Play completion sound
        coachSounds.playScenarioComplete();

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-command-violet" />
              <h3 className="text-lg font-semibold text-white font-mono">
                Scenario Simulator
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {onOpenHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenHistory}
                  className="text-white/60 hover:text-white"
                >
                  <History className="w-4 h-4" />
                </Button>
              )}
              {onToggleCompare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCompare}
                  className={`${
                    isCompareMode 
                      ? 'text-amber-400 bg-amber-500/10' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* What If Command Bar */}
          <div className="flex gap-2 mb-4">
            <Input
              ref={externalRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSimulating && !isRecording) {
                  handleSimulate();
                }
              }}
              placeholder={isRecording ? "Listening..." : "What if I buy a $30k car next month?"}
              className="flex-1 bg-command-bg border-white/10 text-white font-mono placeholder:text-white/40"
              disabled={isSimulating || isRecording || isTranscribing}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={isRecording ? handleVoiceStop : handleVoiceStart}
              disabled={isSimulating || isTranscribing}
              className={cn(
                "border-white/10",
                isRecording && "bg-red-500/20 border-red-500/50 animate-pulse"
              )}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? (
                <Square className="w-4 h-4 text-red-400" />
              ) : isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin text-command-cyan" />
              ) : (
                <Mic className="w-4 h-4 text-command-cyan" />
              )}
            </Button>
            <Button
              onClick={() => handleSimulate()}
              disabled={isSimulating || !input.trim() || isRecording || isTranscribing}
              className="bg-command-violet hover:bg-command-violet/80 text-white font-mono"
            >
              {isSimulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Simulate"
              )}
            </Button>
            {lastSimulation && (
              <Button
                onClick={() => {
                  saveScenario({
                    name: lastSimulation.parameters.name || lastSimulation.input,
                    type: lastSimulation.parameters.type,
                    parameters: lastSimulation.parameters.parameters,
                    outcomes: lastSimulation.data.scenario,
                    successProbability: lastSimulation.data.metadata?.successProbability || 0.5,
                    monteCarloRuns: lastSimulation.data.metadata?.monteCarloRuns || 1000,
                  });
                }}
                variant="outline"
                size="icon"
                disabled={isSaving}
                className="border-white/10 text-white hover:bg-white/5"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            )}
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
                disabled={isSimulating || isRecording || isTranscribing}
                className="text-xs font-mono border-white/10 hover:border-command-violet/50 hover:bg-command-violet/10"
              >
                {scenario.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Timeline Projection Chart */}
        {result && !isCompareMode && (
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
);

ScenarioSimulator.displayName = 'ScenarioSimulator';

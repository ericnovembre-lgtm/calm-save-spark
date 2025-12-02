import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useScenarioHistory } from '@/hooks/useScenarioHistory';
import { InjectedEvent } from '@/hooks/useLifeEventSimulation';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SaveScenarioModalProps {
  open: boolean;
  onClose: () => void;
  scenarioData: {
    events: InjectedEvent[];
    timeline: Array<{ year: number; netWorth: number }>;
    monteCarloData: Array<{ year: number; median: number; p10: number; p90: number }>;
    currentAge: number;
    retirementAge: number;
  };
}

export function SaveScenarioModal({ open, onClose, scenarioData }: SaveScenarioModalProps) {
  const [scenarioName, setScenarioName] = useState('');
  const { saveScenario, isSaving } = useScenarioHistory();

  const handleSave = () => {
    if (!scenarioName.trim()) {
      toast.error('Please enter a scenario name');
      return;
    }

    const parameters = {
      events: scenarioData.events.map(e => ({
        id: e.event.id,
        year: e.year,
        label: e.event.label,
        impact: e.event.impact,
        icon: e.event.icon,
      })),
      currentAge: scenarioData.currentAge,
      retirementAge: scenarioData.retirementAge,
    };

    const outcomes = {
      timeline: scenarioData.timeline,
      finalNetWorth: scenarioData.timeline[scenarioData.timeline.length - 1]?.netWorth || 0,
      retirementAge: scenarioData.retirementAge,
    };

    const successProbability = calculateSuccessProbability(scenarioData.monteCarloData);

    saveScenario({
      name: scenarioName,
      type: 'life_events',
      parameters,
      outcomes,
      successProbability,
      monteCarloRuns: scenarioData.monteCarloData.length,
    });

    setScenarioName('');
    onClose();
  };

  const calculateSuccessProbability = (monteCarloData: any[]) => {
    if (monteCarloData.length === 0) return 0.75;
    
    // Calculate based on median vs p10/p90 spread
    const lastPoint = monteCarloData[monteCarloData.length - 1];
    const spread = lastPoint.p90 - lastPoint.p10;
    const medianValue = lastPoint.median;
    
    // Higher median and smaller spread = higher success probability
    const normalizedSpread = Math.min(spread / medianValue, 1);
    return Math.max(0.5, 1 - normalizedSpread * 0.5);
  };

  const finalNetWorth = scenarioData.timeline[scenarioData.timeline.length - 1]?.netWorth || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-accent font-mono flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Scenario to Database
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scenario Preview */}
          <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Life Events:</span>
              <span className="text-foreground font-mono">{scenarioData.events.length} events</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Final Net Worth:</span>
              <span className="text-green-500 font-mono">
                ${(finalNetWorth / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Retirement Age:</span>
              <span className="text-foreground font-mono">{scenarioData.retirementAge}</span>
            </div>
          </div>

          {/* Event List */}
          {scenarioData.events.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {scenarioData.events.map((e) => (
                <div key={e.id} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                  <span>{e.event.icon}</span>
                  <span>{e.event.label}</span>
                  <span className="text-muted-foreground/60">Age {e.year}</span>
                </div>
              ))}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="scenario-name" className="text-muted-foreground">
              Scenario Name
            </Label>
            <Input
              id="scenario-name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g., Conservative Path, High Growth Strategy"
              className="bg-muted/50 border-border"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !scenarioName.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Database
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, XCircle } from 'lucide-react';
import { useCreditSimulation } from '@/hooks/useCreditSimulation';
import { Button } from '@/components/ui/button';

interface CreditSimulatorProps {
  currentScore: number;
  onProjectedScoreChange: (projectedScore: number | undefined) => void;
}

export const CreditSimulator = ({ currentScore, onProjectedScoreChange }: CreditSimulatorProps) => {
  const { state, result, updateSimulation, resetSimulation } = useCreditSimulation(currentScore);

  const handleReset = () => {
    resetSimulation();
    onProjectedScoreChange(undefined);
  };

  const hasChanges = state.payDownAmount > 0 || state.openNewCard || state.missPayment;

  if (hasChanges) {
    onProjectedScoreChange(result.projectedScore);
  } else {
    onProjectedScoreChange(undefined);
  }

  return (
    <Card className="p-6 backdrop-blur-glass bg-glass border-glass-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-foreground">What-If Simulator</h3>
        {hasChanges && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Pay Down Balance Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="paydown" className="text-sm font-medium text-foreground">
              Pay down card balance
            </Label>
            <Badge variant="outline" className="font-mono">
              ${state.payDownAmount.toLocaleString()}
            </Badge>
          </div>
          <Slider
            id="paydown"
            min={0}
            max={10000}
            step={100}
            value={[state.payDownAmount]}
            onValueChange={([value]) => updateSimulation({ payDownAmount: value })}
            className="w-full"
          />
          {result.breakdown.payDownImpact !== 0 && (
            <p className="text-xs text-muted-foreground">
              Impact: +{result.breakdown.payDownImpact} points
            </p>
          )}
        </div>

        {/* Open New Card Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label htmlFor="newcard" className="text-sm font-medium text-foreground cursor-pointer">
                Open a new credit card
              </Label>
              {state.openNewCard && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Hard inquiry: {result.breakdown.newCardImpact} pts (6-month recovery)
                </p>
              )}
            </div>
          </div>
          <Switch
            id="newcard"
            checked={state.openNewCard}
            onCheckedChange={(checked) => updateSimulation({ openNewCard: checked })}
          />
        </div>

        {/* Miss Payment Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive" />
            <div>
              <Label htmlFor="misspayment" className="text-sm font-medium text-foreground cursor-pointer">
                Miss a payment
              </Label>
              {state.missPayment && (
                <div className="text-xs mt-1 space-y-1">
                  <p className="text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Severe impact: {result.breakdown.missedPaymentImpact} pts
                  </p>
                  <p className="text-muted-foreground">
                    Payment history is 35% of your score
                  </p>
                </div>
              )}
            </div>
          </div>
          <Switch
            id="misspayment"
            checked={state.missPayment}
            onCheckedChange={(checked) => updateSimulation({ missPayment: checked })}
          />
        </div>

        {/* Summary */}
        {hasChanges && (
          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Projected Score:</span>
              <span className="text-2xl font-mono font-bold" style={{ 
                color: result.projectedScore > currentScore 
                  ? 'hsl(142 76% 36%)' 
                  : result.projectedScore < currentScore 
                  ? 'hsl(0 84% 60%)' 
                  : 'hsl(var(--foreground))'
              }}>
                {result.projectedScore}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Change: {result.projectedScore > currentScore ? '+' : ''}
              {result.projectedScore - currentScore} points
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

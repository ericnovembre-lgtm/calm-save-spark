import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Loader2 } from 'lucide-react';
import { useCreditCoach } from '@/hooks/useCreditCoach';
import { Badge } from '@/components/ui/badge';

interface ApprovalPowerCardProps {
  currentScore: number;
}

export const ApprovalPowerCard = ({ currentScore }: ApprovalPowerCardProps) => {
  const [goalType, setGoalType] = useState<string>('');
  const { mutate, isPending, data } = useCreditCoach();

  const handleAnalyze = () => {
    if (!goalType) return;
    mutate({
      mode: 'approval-power',
      data: { score: currentScore, goalType },
    });
  };

  return (
    <Card className="p-6 backdrop-blur-glass bg-glass border-glass-border">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold text-foreground">Approval Power</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal">Financial Goal</Label>
          <Select value={goalType} onValueChange={setGoalType}>
            <SelectTrigger id="goal">
              <SelectValue placeholder="Select a goal..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mortgage">Mortgage</SelectItem>
              <SelectItem value="auto">Auto Loan</SelectItem>
              <SelectItem value="premium-card">Premium Credit Card</SelectItem>
              <SelectItem value="personal-loan">Personal Loan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!goalType || isPending}
          className="w-full"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Analyze Approval Odds
        </Button>

        {data && (
          <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Approval Odds:</span>
              <Badge variant={data.metadata?.odds === 'High' ? 'default' : 'secondary'}>
                {data.metadata?.odds || 'Analyzing...'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.result}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

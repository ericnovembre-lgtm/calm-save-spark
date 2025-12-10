import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, Plus, Trophy, Calendar } from "lucide-react";
import { format } from "date-fns";
import { SharedGoal } from "@/hooks/useCouple";

interface SharedGoalCardProps {
  goal: SharedGoal;
  isPartnerA: boolean;
  onContribute: (goalId: string, amount: number) => void;
  onDelete: (goalId: string) => void;
}

export function SharedGoalCard({ goal, isPartnerA, onContribute, onDelete }: SharedGoalCardProps) {
  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const myContribution = isPartnerA ? goal.partner_a_contribution : goal.partner_b_contribution;
  const partnerContribution = isPartnerA ? goal.partner_b_contribution : goal.partner_a_contribution;
  
  const myPercent = goal.current_amount > 0 ? (myContribution / goal.current_amount) * 100 : 50;
  const partnerPercent = goal.current_amount > 0 ? (partnerContribution / goal.current_amount) * 100 : 50;

  return (
    <Card className={`bg-card border-border ${goal.is_completed ? 'ring-2 ring-green-500' : ''}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{goal.icon}</span>
            <div>
              <h3 className="font-semibold text-foreground">{goal.goal_name}</h3>
              {goal.target_date && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
          {goal.is_completed && (
            <Trophy className="w-6 h-6 text-amber-500" />
          )}
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        
        {/* Contribution split */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Contribution Split</p>
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-primary transition-all"
              style={{ width: `${myPercent}%` }}
              title={`You: $${myContribution.toLocaleString()}`}
            />
            <div 
              className="bg-secondary transition-all"
              style={{ width: `${partnerPercent}%` }}
              title={`Partner: $${partnerContribution.toLocaleString()}`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>You: ${myContribution.toLocaleString()} ({myPercent.toFixed(0)}%)</span>
            <span>Partner: ${partnerContribution.toLocaleString()} ({partnerPercent.toFixed(0)}%)</span>
          </div>
        </div>
        
        {/* Actions */}
        {!goal.is_completed && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onContribute(goal.id, 50)}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add $50
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onContribute(goal.id, 100)}
            >
              +$100
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(goal.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

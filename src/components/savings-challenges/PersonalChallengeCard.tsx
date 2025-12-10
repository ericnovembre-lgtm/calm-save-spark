import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Trophy, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { SavingsChallenge } from "@/hooks/useSavingsChallenges";

interface PersonalChallengeCardProps {
  challenge: SavingsChallenge;
  onUpdateProgress: (challengeId: string, amount: number) => void;
  onDelete: (challengeId: string) => void;
}

export function PersonalChallengeCard({ challenge, onUpdateProgress, onDelete }: PersonalChallengeCardProps) {
  const progress = challenge.target_amount 
    ? Math.min((challenge.current_amount / challenge.target_amount) * 100, 100)
    : 0;
  
  const daysRemaining = differenceInDays(new Date(challenge.end_date), new Date());
  const isExpired = daysRemaining < 0;
  
  const typeLabels: Record<string, string> = {
    no_spend: 'No Spend',
    save_amount: 'Save Amount',
    reduce_category: 'Reduce Spending',
    custom: 'Custom',
    '52_week': '52 Week',
    round_up: 'Round Up',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="relative overflow-hidden bg-card border-border">
        {/* Progress background */}
        <div 
          className="absolute inset-0 bg-primary/5 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        
        <CardHeader className="relative pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{challenge.icon}</span>
              <div>
                <h3 className="font-semibold text-foreground">{challenge.challenge_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {typeLabels[challenge.challenge_type]}
                  </Badge>
                  {challenge.is_completed && (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                      <Trophy className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Streak display */}
            {challenge.streak_count > 0 && (
              <div className="flex items-center gap-1 text-amber-500">
                <Flame className="w-5 h-5" />
                <span className="font-bold">{challenge.streak_count}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* Progress section */}
          {challenge.target_amount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  ${challenge.current_amount.toLocaleString()} / ${challenge.target_amount.toLocaleString()}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {progress.toFixed(0)}% complete
              </p>
            </div>
          )}
          
          {/* Timeline */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Started {format(new Date(challenge.start_date), 'MMM d')}</span>
            <span>
              {isExpired ? (
                <span className="text-red-500">Expired</span>
              ) : (
                `${daysRemaining} days left`
              )}
            </span>
          </div>
          
          {/* Best streak */}
          {challenge.best_streak > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Best streak: {challenge.best_streak} days</span>
            </div>
          )}
          
          {/* Actions */}
          {!challenge.is_completed && !isExpired && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onUpdateProgress(challenge.id, 10)}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Progress
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(challenge.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BudgetAlertCardProps {
  category: string;
  limit: number;
  current: number;
  warningMessage: string;
  onViewDetails?: () => void;
}

export function BudgetAlertCard({ 
  category, 
  limit, 
  current, 
  warningMessage,
  onViewDetails 
}: BudgetAlertCardProps) {
  const percentage = (current / limit) * 100;
  const isOverBudget = percentage > 100;
  const isWarning = percentage > 70 && percentage <= 100;
  const isOk = percentage <= 70;

  const variant = isOverBudget ? 'destructive' : isWarning ? 'warning' : 'success';
  const bgColor = isOverBudget 
    ? 'bg-destructive/10 border-destructive/30' 
    : isWarning 
    ? 'bg-warning/10 border-warning/30'
    : 'bg-primary/10 border-primary/30';

  const progressColor = isOverBudget 
    ? 'bg-destructive' 
    : isWarning 
    ? 'bg-warning'
    : 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("p-4 backdrop-blur-sm border", bgColor)}>
        <div className="flex items-start gap-3">
          {isOverBudget || isWarning ? (
            <AlertTriangle className={cn(
              "w-5 h-5 mt-0.5 flex-shrink-0",
              isOverBudget ? "text-destructive" : "text-warning"
            )} />
          ) : (
            <TrendingUp className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
          )}
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground text-sm">{category}</h3>
              <p className="text-xs text-muted-foreground mt-1">{warningMessage}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">
                  ${current.toFixed(2)} of ${limit.toFixed(2)}
                </span>
                <span className={cn(
                  "font-semibold",
                  isOverBudget ? "text-destructive" : isWarning ? "text-warning" : "text-primary"
                )}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              
              <Progress 
                value={Math.min(percentage, 100)} 
                className={cn("h-2", progressColor)}
              />
            </div>

            {onViewDetails && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onViewDetails}
                className="w-full text-xs"
              >
                View Budget Details
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

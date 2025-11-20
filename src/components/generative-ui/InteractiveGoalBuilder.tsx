import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { CalendarIcon, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InteractiveGoalBuilderProps {
  suggestedAmount?: number;
  suggestedDate?: string;
  goalType?: string;
  onCreateGoal?: (data: {
    name: string;
    targetAmount: number;
    targetDate: Date;
    monthlyContribution: number;
  }) => void;
}

export function InteractiveGoalBuilder({
  suggestedAmount = 5000,
  suggestedDate,
  goalType = "savings goal",
  onCreateGoal,
}: InteractiveGoalBuilderProps) {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState(suggestedAmount);
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    suggestedDate ? new Date(suggestedDate) : undefined
  );
  const [monthlyContribution, setMonthlyContribution] = useState(200);

  const handleCreate = () => {
    if (!goalName.trim() || !targetDate) return;
    onCreateGoal?.({
      name: goalName,
      targetAmount,
      targetDate,
      monthlyContribution,
    });
  };

  const monthsToGoal = targetDate
    ? Math.max(
        1,
        Math.ceil(
          (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
        )
      )
    : 12;

  const projectedTotal = monthlyContribution * monthsToGoal;
  const onTrack = projectedTotal >= targetAmount;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">
              Build Your {goalType}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Customize your goal with the interactive builder below
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="goal-name" className="text-sm font-medium">
              Goal Name
            </Label>
            <Input
              id="goal-name"
              placeholder="e.g., Emergency Fund, Dream Vacation"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="bg-background/50"
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-medium">Target Amount</Label>
              <span className="text-2xl font-bold text-primary">
                ${targetAmount.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[targetAmount]}
              onValueChange={(value) => setTargetAmount(value[0])}
              min={100}
              max={50000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$100</span>
              <span>$50,000</span>
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background/50",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-medium">
                Monthly Contribution
              </Label>
              <span className="text-lg font-semibold text-foreground">
                ${monthlyContribution.toLocaleString()}/mo
              </span>
            </div>
            <Slider
              value={[monthlyContribution]}
              onValueChange={(value) => setMonthlyContribution(value[0])}
              min={10}
              max={2000}
              step={10}
              className="w-full"
            />
          </div>

          {/* Progress Projection */}
          {targetDate && (
            <div
              className={cn(
                "p-4 rounded-lg border",
                onTrack
                  ? "bg-primary/5 border-primary/20"
                  : "bg-warning/5 border-warning/20"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp
                  className={cn(
                    "w-4 h-4",
                    onTrack ? "text-primary" : "text-warning"
                  )}
                />
                <span className="text-sm font-medium">Goal Projection</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                In {monthsToGoal} months, you'll have saved:
              </p>
              <div className="text-2xl font-bold mb-1">
                ${projectedTotal.toLocaleString()}
              </div>
              {!onTrack && (
                <p className="text-xs text-warning">
                  Increase monthly contribution by $
                  {Math.ceil((targetAmount - projectedTotal) / monthsToGoal)} to
                  reach your goal
                </p>
              )}
              {onTrack && projectedTotal > targetAmount && (
                <p className="text-xs text-primary">
                  You'll exceed your goal by $
                  {(projectedTotal - targetAmount).toLocaleString()}!
                </p>
              )}
            </div>
          )}

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!goalName.trim() || !targetDate}
            className="w-full"
            size="lg"
          >
            Create Goal
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

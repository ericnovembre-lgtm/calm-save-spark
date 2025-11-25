import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditGoalSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentScore: number;
  onSubmit: (goal: {
    target_score: number;
    reason?: string;
    target_date?: string;
    starting_score: number;
  }) => void;
  isLoading?: boolean;
}

const GOAL_PRESETS = [
  { score: 700, label: "700 - Good Credit", reason: "General improvement" },
  { score: 720, label: "720 - Better rates", reason: "Better interest rates" },
  { score: 740, label: "740 - Very Good", reason: "Premium credit cards" },
  { score: 750, label: "750 - Mortgage ready", reason: "Mortgage approval" },
  { score: 780, label: "780 - Excellent", reason: "Best rates available" },
  { score: 800, label: "800 - Exceptional", reason: "Top-tier credit" },
];

export function CreditGoalSetupModal({
  open,
  onOpenChange,
  currentScore,
  onSubmit,
  isLoading,
}: CreditGoalSetupModalProps) {
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");
  const [targetDate, setTargetDate] = useState<Date | undefined>();

  const handleSubmit = () => {
    if (!targetScore) return;

    onSubmit({
      target_score: targetScore,
      reason: reason || undefined,
      target_date: targetDate?.toISOString(),
      starting_score: currentScore,
    });

    // Reset form
    setTargetScore(null);
    setReason("");
    setTargetDate(undefined);
  };

  const availablePresets = GOAL_PRESETS.filter((preset) => preset.score > currentScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Credit Score Goal</DialogTitle>
          <DialogDescription>
            Current score: <strong>{currentScore}</strong>. Choose your target score and timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="target-score">Target Score</Label>
            <Select
              value={targetScore?.toString()}
              onValueChange={(value) => {
                const score = parseInt(value);
                setTargetScore(score);
                const preset = GOAL_PRESETS.find((p) => p.score === score);
                if (preset) setReason(preset.reason);
              }}
            >
              <SelectTrigger id="target-score">
                <SelectValue placeholder="Choose your goal" />
              </SelectTrigger>
              <SelectContent>
                {availablePresets.map((preset) => (
                  <SelectItem key={preset.score} value={preset.score.toString()}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Why this goal?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mortgage approval">Mortgage approval</SelectItem>
                <SelectItem value="Auto loan">Auto loan</SelectItem>
                <SelectItem value="Premium credit cards">Premium credit cards</SelectItem>
                <SelectItem value="Better interest rates">Better interest rates</SelectItem>
                <SelectItem value="Personal goal">Personal goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!targetScore || isLoading}
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Set Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

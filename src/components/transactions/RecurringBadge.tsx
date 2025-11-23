import { Repeat, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface RecurringBadgeProps {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  confidence: number;
  nextExpected?: string;
}

export function RecurringBadge({ frequency, confidence, nextExpected }: RecurringBadgeProps) {
  const frequencyLabels = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };

  const tooltipContent = nextExpected
    ? `Recurring charge • Next expected: ${format(new Date(nextExpected), 'MMM dd, yyyy')}`
    : `Recurring ${frequency} charge`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="gap-1 text-xs border-success/50 text-success hover:bg-success/10"
          >
            <Repeat className="w-3 h-3" />
            {frequencyLabels[frequency]}
            {confidence > 0.9 && <Sparkles className="w-2 h-2" />}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipContent}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {(confidence * 100).toFixed(0)}% confidence
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

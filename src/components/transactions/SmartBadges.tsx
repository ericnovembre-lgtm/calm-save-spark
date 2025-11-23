import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import { RecurringBadge } from './RecurringBadge';
import { cn } from '@/lib/utils';

interface SmartBadgesProps {
  category: string;
  isAIEnriched: boolean;
  confidence?: number;
  isRecurring?: boolean;
  recurringInfo?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    confidence: number;
    nextExpected?: string;
  };
  isHighSpending: boolean;
  isProcessing: boolean;
  className?: string;
}

export function SmartBadges({
  category,
  isAIEnriched,
  confidence = 0,
  isRecurring,
  recurringInfo,
  isHighSpending,
  isProcessing,
  className,
}: SmartBadgesProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* 1. Processing Badge (highest priority) */}
      {isProcessing && (
        <Badge 
          variant="outline" 
          className="gap-1 text-xs animate-pulse border-accent/50 text-accent"
        >
          <Sparkles className="w-3 h-3 animate-spin" />
          Categorizing...
        </Badge>
      )}

      {/* 2. Category Badge (always show if not processing) */}
      {!isProcessing && category && (
        <Badge variant="secondary" className="text-xs">
          {category}
        </Badge>
      )}

      {/* 3. Recurring Badge */}
      {isRecurring && recurringInfo && (
        <RecurringBadge
          frequency={recurringInfo.frequency}
          confidence={recurringInfo.confidence}
          nextExpected={recurringInfo.nextExpected}
        />
      )}

      {/* 4. High Confidence AI Badge */}
      {isAIEnriched && confidence > 0.85 && !isProcessing && (
        <Badge 
          variant="outline" 
          className="gap-1 text-xs border-accent/30 text-accent"
        >
          <Sparkles className="w-2.5 h-2.5" />
          AI
        </Badge>
      )}

      {/* 5. High Spending Badge */}
      {isHighSpending && (
        <Badge 
          variant="outline" 
          className="gap-1 text-xs border-warning/30 text-warning bg-warning/5"
        >
          <TrendingUp className="w-3 h-3" />
          Above Average
        </Badge>
      )}
    </div>
  );
}
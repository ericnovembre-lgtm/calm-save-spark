import { useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FeasibilityData, calculateMonthsToGoal } from '@/lib/ephemeral-widgets';

interface FeasibilityCalculatorProps {
  data: FeasibilityData;
  title: string;
}

export function FeasibilityCalculator({ data, title }: FeasibilityCalculatorProps) {
  const [monthlyAmount, setMonthlyAmount] = useState(
    data.alternatives.find(a => a.label === 'Comfortable')?.monthlyAmount || 
    Math.round((data.goalAmount - data.currentSavings) / 6)
  );

  const progress = (data.currentSavings / data.goalAmount) * 100;
  const monthsNeeded = calculateMonthsToGoal(data.goalAmount, data.currentSavings, monthlyAmount);
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsNeeded);

  const deadlineDate = new Date(data.deadline);
  const isOnTrack = targetDate <= deadlineDate;

  return (
    <div className="space-y-6">
      {/* Progress visualization */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            ${data.currentSavings.toLocaleString()} / ${data.goalAmount.toLocaleString()}
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              data.feasible ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-amber-500 to-amber-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {progress.toFixed(1)}% complete
        </p>
      </div>

      {/* Feasibility indicator */}
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        data.feasible ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"
      )}>
        {data.feasible ? (
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        ) : (
          <XCircle className="w-5 h-5 text-amber-500" />
        )}
        <div className="flex-1">
          <p className={cn(
            "font-medium text-sm",
            data.feasible ? "text-emerald-500" : "text-amber-500"
          )}>
            {data.feasible ? 'Achievable!' : 'Stretch Goal'}
          </p>
          <p className="text-xs text-muted-foreground">
            Confidence: {data.confidenceScore}%
          </p>
        </div>
      </div>

      {/* Interactive slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Monthly savings</span>
          <span className="text-lg font-bold text-primary">
            $<CountUp end={monthlyAmount} duration={0.5} />
          </span>
        </div>
        <Slider
          value={[monthlyAmount]}
          onValueChange={([value]) => setMonthlyAmount(value)}
          min={50}
          max={data.monthlyCapacity}
          step={25}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$50/mo</span>
          <span>Max: ${data.monthlyCapacity}/mo</span>
        </div>
      </div>

      {/* Timeline calculation */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Target date</span>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-medium",
            isOnTrack ? "text-emerald-500" : "text-amber-500"
          )}>
            {targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground">
            {monthsNeeded} months
          </p>
        </div>
      </div>

      {/* Alternative scenarios */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Savings plans</p>
        <div className="grid grid-cols-3 gap-2">
          {data.alternatives.map((alt) => (
            <button
              key={alt.label}
              onClick={() => setMonthlyAmount(alt.monthlyAmount)}
              className={cn(
                "p-2 rounded-lg border text-center transition-colors",
                monthlyAmount === alt.monthlyAmount
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="text-xs text-muted-foreground">{alt.label}</p>
              <p className="font-medium text-sm">${alt.monthlyAmount}</p>
              <p className="text-xs text-muted-foreground">{alt.months} mo</p>
            </button>
          ))}
        </div>
      </div>

      {/* AI recommendation */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
          <p className="text-sm text-foreground">{data.recommendation}</p>
        </div>
      </div>

      {/* Action button */}
      <Button className="w-full" variant="default">
        Create Savings Goal
      </Button>
    </div>
  );
}

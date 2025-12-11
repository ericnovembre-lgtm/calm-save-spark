/**
 * MonteCarloBackgroundTrigger - Trigger and monitor deep Monte Carlo simulations
 * 
 * Uses Trigger.dev for long-running calculations without blocking the UI
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMonteCarloBackgroundJob } from '@/hooks/useMonteCarloBackgroundJob';
import { cn } from '@/lib/utils';

interface InjectedEvent {
  id: string;
  label: string;
  year: number;
  impact: number;
  type: 'income' | 'expense' | 'asset' | 'liability';
}

interface MonteCarloBackgroundTriggerProps {
  currentAge: number;
  retirementAge: number;
  startingNetWorth: number;
  events: InjectedEvent[];
  onComplete?: (result: unknown) => void;
  className?: string;
}

export function MonteCarloBackgroundTrigger({
  currentAge,
  retirementAge,
  startingNetWorth,
  events,
  onComplete,
  className,
}: MonteCarloBackgroundTriggerProps) {
  const [iterations, setIterations] = useState(10000);
  
  const {
    isSubmitting,
    isSimulating,
    isComplete,
    isFailed,
    progress,
    progressMessage,
    result,
    error,
    runSimulation,
    cancelSimulation,
    resetJob,
  } = useMonteCarloBackgroundJob();

  const handleRunSimulation = async () => {
    try {
      await runSimulation({
        currentAge,
        retirementAge,
        startingNetWorth,
        events,
        iterations,
      });
    } catch (err) {
      console.error('Failed to start simulation:', err);
    }
  };

  // Notify parent when complete
  if (isComplete && result && onComplete) {
    onComplete(result);
  }

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Deep Simulation</span>
        </div>
        
        {/* Iteration selector */}
        <select
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          disabled={isSimulating}
          className="text-xs bg-muted border-0 rounded px-2 py-1"
        >
          <option value={1000}>1,000 runs</option>
          <option value={5000}>5,000 runs</option>
          <option value={10000}>10,000 runs</option>
          <option value={25000}>25,000 runs</option>
          <option value={50000}>50,000 runs</option>
        </select>
      </div>

      <AnimatePresence mode="wait">
        {/* Idle state */}
        {!isSimulating && !isComplete && !isFailed && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xs text-muted-foreground mb-3">
              Run a comprehensive Monte Carlo simulation with {iterations.toLocaleString()} iterations 
              for more accurate projections.
            </p>
            <Button
              onClick={handleRunSimulation}
              disabled={isSubmitting}
              size="sm"
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Deep Simulation
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Running state */}
        {isSimulating && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{progressMessage}</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <Button
              onClick={cancelSimulation}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </motion.div>
        )}

        {/* Complete state */}
        {isComplete && result && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Simulation Complete</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted rounded p-2">
                <span className="text-muted-foreground block">Success Rate</span>
                <span className="font-semibold">
                  {((result as { successRate?: number }).successRate || 0 * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-muted rounded p-2">
                <span className="text-muted-foreground block">Median Final</span>
                <span className="font-semibold">
                  ${((result as { medianFinalNetWorth?: number }).medianFinalNetWorth || 0).toLocaleString()}
                </span>
              </div>
            </div>
            
            <Button
              onClick={resetJob}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Run Another Simulation
            </Button>
          </motion.div>
        )}

        {/* Error state */}
        {isFailed && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Simulation Failed</span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {error || 'An unexpected error occurred. Please try again.'}
            </p>
            
            <Button
              onClick={resetJob}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

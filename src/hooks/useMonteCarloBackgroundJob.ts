import { useCallback } from 'react';
import { useTriggerJob } from './useTriggerJob';
import { supabase } from '@/integrations/supabase/client';
import type { JobType } from '@/lib/trigger';

interface InjectedEvent {
  id: string;
  label: string;
  year: number;
  impact: number;
  type: 'income' | 'expense' | 'asset' | 'liability';
}

interface MonteCarloJobParams {
  currentAge: number;
  retirementAge: number;
  startingNetWorth: number;
  events: InjectedEvent[];
  iterations?: number;
  volatility?: number;
  expectedReturn?: number;
}

interface MonteCarloResult {
  percentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
  successRate: number;
  medianFinalNetWorth: number;
  years: number[];
}

/**
 * Hook for running Monte Carlo simulations as background jobs via Trigger.dev
 * 
 * Use this for heavy simulations (10,000+ iterations) that would block the UI
 */
export function useMonteCarloBackgroundJob() {
  const {
    jobId,
    status,
    isSubmitting,
    isRunning,
    isComplete,
    isFailed,
    progress,
    result,
    error,
    submit,
    cancel,
    reset,
  } = useTriggerJob({
    pollInterval: 1500,
    onComplete: async (resultData) => {
      // Cache the result in Supabase for future retrieval
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && resultData) {
          await supabase.from('api_response_cache').insert([{
            user_id: user.id,
            cache_key: `monte_carlo_${Date.now()}`,
            cache_type: 'monte_carlo_simulation',
            response_data: JSON.parse(JSON.stringify(resultData)),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }]);
        }
      } catch (err) {
        console.error('Failed to cache simulation result:', err);
      }
    },
  });

  const runSimulation = useCallback(async (params: MonteCarloJobParams) => {
    const payload = {
      type: 'monte-carlo-simulation' as JobType,
      data: {
        ...params,
        iterations: params.iterations || 10000,
        volatility: params.volatility || 0.15,
        expectedReturn: params.expectedReturn || 0.07,
      },
    };

    return submit(payload);
  }, [submit]);

  // Derive progress message from status
  const getProgressMessage = () => {
    if (!status) return 'Initializing simulation...';
    switch (status.status) {
      case 'pending': return 'Queued for processing...';
      case 'running': return `Running simulation (${progress || 0}%)...`;
      case 'completed': return 'Simulation complete!';
      case 'failed': return 'Simulation failed';
      default: return 'Processing...';
    }
  };

  return {
    // Job state
    jobId,
    status,
    isSubmitting,
    isSimulating: isRunning,
    isComplete,
    isFailed,
    
    // Progress tracking
    progress: progress || 0,
    progressMessage: getProgressMessage(),
    
    // Results
    result: result as MonteCarloResult | null,
    error,
    
    // Actions
    runSimulation,
    cancelSimulation: cancel,
    resetJob: reset,
  };
}

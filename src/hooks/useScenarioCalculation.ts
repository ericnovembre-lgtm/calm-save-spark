import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/performance-utils';

interface ScenarioParams {
  monthlyInvestment: number;
  savingsRate: number;
  timeHorizonYears: number;
  emergencyFund: number;
}

interface ScenarioResult {
  conservative: { date: string; value: number }[];
  moderate: { date: string; value: number }[];
  aggressive: { date: string; value: number }[];
  baseline: { date: string; value: number }[];
}

export function useScenarioCalculation(initialParams: ScenarioParams) {
  const [params, setParams] = useState<ScenarioParams>(initialParams);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateScenario = useCallback(async (newParams: ScenarioParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('calculate-scenarios', {
        body: { params: newParams }
      });

      if (fnError) throw fnError;

      setResult(data);
    } catch (err) {
      console.error('Scenario calculation failed:', err);
      setError('Failed to calculate scenario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedCalculate = useCallback(
    debounce((newParams: ScenarioParams) => {
      calculateScenario(newParams);
    }, 300),
    [calculateScenario]
  );

  const updateParams = useCallback((updates: Partial<ScenarioParams>) => {
    const newParams = { ...params, ...updates };
    setParams(newParams);
    debouncedCalculate(newParams);
  }, [params, debouncedCalculate]);

  // Initial calculation
  useEffect(() => {
    calculateScenario(params);
  }, []); // Only on mount

  return {
    params,
    result,
    isLoading,
    error,
    updateParams,
    recalculate: () => calculateScenario(params),
  };
}

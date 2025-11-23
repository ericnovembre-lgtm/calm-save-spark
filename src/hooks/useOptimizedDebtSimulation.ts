import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebouncedValue } from './useDebouncedValue';
import { useMemo } from 'react';

interface SimulationParams {
  strategy: 'avalanche' | 'snowball';
  extraPayment: number;
  enabled: boolean;
}

/**
 * Optimized debt simulation hook with debouncing for <100ms UI updates
 */
export function useOptimizedDebtSimulation({ strategy, extraPayment, enabled }: SimulationParams) {
  // Debounce the extra payment to 100ms for backend queries
  const debouncedExtraPayment = useDebouncedValue(extraPayment, 100);

  const { data, isLoading } = useQuery({
    queryKey: ['debt_simulation', strategy, debouncedExtraPayment],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debt-payoff-simulator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ strategy, extraPayment: debouncedExtraPayment })
        }
      );

      if (!response.ok) throw new Error('Simulation failed');
      return response.json();
    },
    enabled,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Memoize the summary data
  const summary = useMemo(() => data?.summary, [data]);
  const simulation = useMemo(() => data?.simulation, [data]);

  return {
    summary,
    simulation,
    isLoading
  };
}

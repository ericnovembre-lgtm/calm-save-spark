import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SensitivityItem {
  parameter: string;
  impact_score: number;
  explanation: string;
}

interface ControlFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface UncontrollableFactor {
  factor: string;
  mitigation: string;
}

interface ScenarioRisk {
  scenario: string;
  probability: string;
  impact: string;
  mitigation: string;
}

interface MilestoneProjection {
  milestone: string;
  median_year: number;
  range: string;
}

export interface MonteCarloExplanation {
  sensitivity_analysis: SensitivityItem[];
  risk_narrative: string;
  control_factors: ControlFactor[];
  uncontrollable_factors: UncontrollableFactor[];
  confidence_explanation: string;
  key_insight: string;
  scenario_risks: ScenarioRisk[];
  milestone_projections: MilestoneProjection[];
  reasoning_chain: string | null;
  model: string;
  response_time_ms: number;
}

interface SimulationMetadata {
  scenarioId?: string;
  successProbability: number;
  percentiles: {
    p10: number;
    p50: number;
    p90: number;
  };
  simulations: number;
}

interface TimelinePoint {
  year: number;
  age: number;
  median: number;
  p10: number;
  p90: number;
}

interface LifeEvent {
  type: string;
  year: number;
  impact: number;
}

interface CurrentState {
  netWorth?: number;
  savings?: number;
  annualIncome?: number;
  annualExpenses?: number;
  age?: number;
}

interface UseMonteCarloExplanationParams {
  simulationMetadata: SimulationMetadata | null;
  timeline: TimelinePoint[] | null;
  lifeEvents?: LifeEvent[];
  currentState?: CurrentState;
  enabled?: boolean;
}

export function useMonteCarloExplanation({
  simulationMetadata,
  timeline,
  lifeEvents = [],
  currentState = {},
  enabled = true
}: UseMonteCarloExplanationParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['monte_carlo_explanation', simulationMetadata?.scenarioId, simulationMetadata?.successProbability],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monte-carlo-explain`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            simulationMetadata,
            timeline,
            percentiles: simulationMetadata?.percentiles,
            lifeEvents,
            currentState
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI explanation');
      }

      return response.json() as Promise<MonteCarloExplanation>;
    },
    enabled: enabled && !!simulationMetadata && !!timeline,
    staleTime: 300000, // Cache for 5 minutes (expensive operation)
    retry: 1,
  });

  return {
    explanation: data || null,
    isLoading,
    error: error as Error | null,
    refetch
  };
}

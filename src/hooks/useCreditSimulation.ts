import { useState, useCallback } from 'react';

export interface SimulationState {
  payDownAmount: number;
  openNewCard: boolean;
  missPayment: boolean;
}

export interface SimulationResult {
  projectedScore: number;
  breakdown: {
    payDownImpact: number;
    newCardImpact: number;
    missedPaymentImpact: number;
  };
}

export const useCreditSimulation = (currentScore: number, currentUtilization: number = 45) => {
  const [state, setState] = useState<SimulationState>({
    payDownAmount: 0,
    openNewCard: false,
    missPayment: false,
  });

  const calculateProjectedScore = useCallback(
    (simState: SimulationState): SimulationResult => {
      let projected = currentScore;
      const breakdown = {
        payDownImpact: 0,
        newCardImpact: 0,
        missedPaymentImpact: 0,
      };

      // Pay down balance calculation (every $1,000 = ~1-3 points if utilization > 30%)
      if (simState.payDownAmount > 0 && currentUtilization > 30) {
        const utilizationReduction = (simState.payDownAmount / 1000) * 2;
        breakdown.payDownImpact = Math.min(30, Math.round(utilizationReduction));
        projected += breakdown.payDownImpact;
      }

      // New card impact (hard inquiry)
      if (simState.openNewCard) {
        breakdown.newCardImpact = -7;
        projected += breakdown.newCardImpact;
      }

      // Missed payment impact (severe)
      if (simState.missPayment) {
        breakdown.missedPaymentImpact = -75;
        projected += breakdown.missedPaymentImpact;
      }

      return {
        projectedScore: Math.max(300, Math.min(850, Math.round(projected))),
        breakdown,
      };
    },
    [currentScore, currentUtilization]
  );

  const updateSimulation = useCallback((updates: Partial<SimulationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSimulation = useCallback(() => {
    setState({
      payDownAmount: 0,
      openNewCard: false,
      missPayment: false,
    });
  }, []);

  const result = calculateProjectedScore(state);

  return {
    state,
    result,
    updateSimulation,
    resetSimulation,
  };
};

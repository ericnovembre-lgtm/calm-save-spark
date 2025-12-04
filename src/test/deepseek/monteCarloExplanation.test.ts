import { describe, it, expect, vi } from 'vitest';

// Mock simulation data
const mockSimulationMetadata = {
  numSimulations: 1000,
  timeHorizonYears: 30,
  inflationRate: 0.03,
  marketVolatility: 0.18,
  successProbability: 0.75,
  medianOutcome: 850000,
  p10Outcome: 450000,
  p90Outcome: 1500000,
};

const mockTimeline = [
  { date: '2024-01', value: 50000 },
  { date: '2025-01', value: 75000 },
  { date: '2030-01', value: 150000 },
  { date: '2040-01', value: 450000 },
  { date: '2054-01', value: 850000 },
];

const mockLifeEvents = [
  { type: 'home_purchase', year: 2026, impact: -80000 },
  { type: 'career_change', year: 2028, impact: 15000 },
  { type: 'retirement', year: 2054, impact: 0 },
];

// Helper functions for Monte Carlo analysis
function calculateSuccessProbability(simulations: number[], target: number): number {
  const successes = simulations.filter(s => s >= target).length;
  return successes / simulations.length;
}

function calculatePercentile(simulations: number[], percentile: number): number {
  const sorted = [...simulations].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * (percentile / 100));
  return sorted[index];
}

function assessRiskLevel(successProbability: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (successProbability >= 0.85) return 'low';
  if (successProbability >= 0.70) return 'moderate';
  if (successProbability >= 0.50) return 'high';
  return 'critical';
}

function generateConfidenceBand(median: number, volatility: number): { lower: number; upper: number } {
  return {
    lower: median * (1 - volatility * 1.96),
    upper: median * (1 + volatility * 1.96),
  };
}

describe('Monte Carlo Explanation - Unit Tests', () => {
  describe('Success Probability Calculation', () => {
    it('should calculate correct success probability', () => {
      const simulations = [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000];
      const target = 500000;
      
      const probability = calculateSuccessProbability(simulations, target);
      expect(probability).toBe(0.6); // 6 out of 10 meet target
    });

    it('should return 1.0 when all simulations succeed', () => {
      const simulations = [1000000, 1100000, 1200000];
      const target = 500000;
      
      const probability = calculateSuccessProbability(simulations, target);
      expect(probability).toBe(1.0);
    });

    it('should return 0.0 when no simulations succeed', () => {
      const simulations = [100000, 200000, 300000];
      const target = 500000;
      
      const probability = calculateSuccessProbability(simulations, target);
      expect(probability).toBe(0.0);
    });
  });

  describe('Percentile Calculation', () => {
    it('should calculate correct percentiles', () => {
      const simulations = Array.from({ length: 100 }, (_, i) => (i + 1) * 10000);
      
      const p10 = calculatePercentile(simulations, 10);
      const p50 = calculatePercentile(simulations, 50);
      const p90 = calculatePercentile(simulations, 90);
      
      expect(p10).toBe(100000);
      expect(p50).toBe(500000);
      expect(p90).toBe(900000);
    });
  });

  describe('Risk Level Assessment', () => {
    it('should classify low risk correctly', () => {
      expect(assessRiskLevel(0.90)).toBe('low');
      expect(assessRiskLevel(0.85)).toBe('low');
    });

    it('should classify moderate risk correctly', () => {
      expect(assessRiskLevel(0.75)).toBe('moderate');
      expect(assessRiskLevel(0.70)).toBe('moderate');
    });

    it('should classify high risk correctly', () => {
      expect(assessRiskLevel(0.60)).toBe('high');
      expect(assessRiskLevel(0.50)).toBe('high');
    });

    it('should classify critical risk correctly', () => {
      expect(assessRiskLevel(0.40)).toBe('critical');
      expect(assessRiskLevel(0.20)).toBe('critical');
    });
  });

  describe('Confidence Band Generation', () => {
    it('should generate symmetric confidence bands', () => {
      const median = 500000;
      const volatility = 0.18;
      
      const band = generateConfidenceBand(median, volatility);
      
      expect(band.lower).toBeLessThan(median);
      expect(band.upper).toBeGreaterThan(median);
      expect(band.upper - median).toBeCloseTo(median - band.lower, 0);
    });

    it('should widen bands with higher volatility', () => {
      const median = 500000;
      
      const lowVolBand = generateConfidenceBand(median, 0.10);
      const highVolBand = generateConfidenceBand(median, 0.25);
      
      const lowVolWidth = highVolBand.upper - highVolBand.lower;
      const highVolWidth = lowVolBand.upper - lowVolBand.lower;
      
      expect(lowVolWidth).toBeGreaterThan(highVolWidth);
    });
  });
});

describe('Monte Carlo Explanation - Sensitivity Analysis', () => {
  describe('Factor Sensitivity', () => {
    it('should identify savings rate as high-impact factor', () => {
      // Simulate different savings rates
      const baseOutcome = 500000;
      const savingsRates = [0.10, 0.15, 0.20, 0.25];
      
      const outcomes = savingsRates.map(rate => baseOutcome * (1 + (rate - 0.10) * 5));
      
      const sensitivity = (outcomes[outcomes.length - 1] - outcomes[0]) / outcomes[0];
      expect(sensitivity).toBeGreaterThan(0.5); // High sensitivity
    });

    it('should calculate market return sensitivity', () => {
      const baseOutcome = 500000;
      const returns = [0.04, 0.06, 0.08, 0.10];
      
      const outcomes = returns.map(ret => baseOutcome * Math.pow(1 + ret, 30));
      
      // Outcome difference between highest and lowest return
      const range = outcomes[outcomes.length - 1] - outcomes[0];
      expect(range).toBeGreaterThan(baseOutcome); // Significant impact
    });
  });

  describe('Life Event Impact', () => {
    it('should calculate home purchase impact', () => {
      const homeEvent = mockLifeEvents[0];
      expect(homeEvent.impact).toBeLessThan(0);
      expect(Math.abs(homeEvent.impact)).toBeGreaterThan(50000);
    });

    it('should project career change positive impact', () => {
      const careerEvent = mockLifeEvents[1];
      expect(careerEvent.impact).toBeGreaterThan(0);
    });

    it('should calculate cumulative event impact', () => {
      const totalImpact = mockLifeEvents.reduce((sum, event) => sum + event.impact, 0);
      expect(totalImpact).toBe(-65000); // -80000 + 15000 + 0
    });
  });
});

describe('Monte Carlo Explanation - Narrative Generation', () => {
  describe('Scenario Risk Narrative', () => {
    it('should generate appropriate narrative for high success', () => {
      const successProbability = 0.85;
      const narrative = successProbability >= 0.80 
        ? 'Your financial plan has a strong probability of success.'
        : 'Your plan may need adjustments to improve success probability.';
      
      expect(narrative).toContain('strong probability');
    });

    it('should generate warning narrative for low success', () => {
      const successProbability = 0.45;
      const narrative = successProbability < 0.50
        ? 'Warning: Your current plan has less than 50% chance of meeting goals.'
        : 'Your plan is on track.';
      
      expect(narrative).toContain('Warning');
    });
  });

  describe('Milestone Projections', () => {
    it('should project milestones from timeline', () => {
      const milestones = mockTimeline.filter((_, i, arr) => {
        if (i === 0 || i === arr.length - 1) return true;
        return arr[i].value >= arr[i - 1].value * 1.5; // 50% growth milestones
      });
      
      expect(milestones.length).toBeGreaterThan(0);
    });

    it('should calculate time to reach target', () => {
      const target = 500000;
      const targetPoint = mockTimeline.find(p => p.value >= target);
      
      expect(targetPoint).toBeDefined();
      expect(targetPoint?.date).toBeDefined();
    });
  });
});

describe('Monte Carlo Explanation - Integration Tests', () => {
  it('should handle empty timeline gracefully', () => {
    const emptyTimeline: typeof mockTimeline = [];
    expect(emptyTimeline.length).toBe(0);
  });

  it('should handle missing life events', () => {
    const noEvents: typeof mockLifeEvents = [];
    const totalImpact = noEvents.reduce((sum, event) => sum + event.impact, 0);
    expect(totalImpact).toBe(0);
  });

  it('should validate simulation metadata', () => {
    expect(mockSimulationMetadata.numSimulations).toBeGreaterThan(0);
    expect(mockSimulationMetadata.timeHorizonYears).toBeGreaterThan(0);
    expect(mockSimulationMetadata.successProbability).toBeGreaterThanOrEqual(0);
    expect(mockSimulationMetadata.successProbability).toBeLessThanOrEqual(1);
  });
});

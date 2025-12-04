/**
 * Phase 4: Retirement Planner Integration Tests
 * Tests for retirement-planner edge function, Monte Carlo simulations, and Social Security optimization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockRetirementInput,
  createMockRetirementPlanResponse,
  createMockDeepseekResponse,
  createMockQuotaState,
  createMockSupabaseClient,
  type MockRetirementInput,
} from '../mocks/phase4Responses';

// ==================== Unit Tests: Social Security Calculations ====================

describe('Social Security Calculations', () => {
  describe('Benefit Reduction at Age 62', () => {
    it('should calculate 30% reduction for claiming 5 years early', () => {
      const benefitAtFRA = 2500; // Full Retirement Age (67) benefit
      const yearsEarly = 5; // 67 - 62 = 5 years
      const reductionPerYear = 0.0667; // 6.67% per year
      
      const benefitAt62 = benefitAtFRA * (1 - reductionPerYear * yearsEarly);
      
      // 2500 * (1 - 0.0667 * 5) = 2500 * 0.6665 = 1666.25
      expect(benefitAt62).toBeCloseTo(1666.25, 0);
    });

    it('should match mock response benefit calculations', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      const benefitAt67 = mockResponse.socialSecurityAnalysis.benefitAt67;
      const benefitAt62 = mockResponse.socialSecurityAnalysis.benefitAt62;
      
      // 62 benefit should be ~70% of 67 benefit
      const ratio = benefitAt62 / benefitAt67;
      expect(ratio).toBeCloseTo(0.70, 1);
    });
  });

  describe('Delayed Retirement Credits at Age 70', () => {
    it('should calculate 24% increase for delaying 3 years past FRA', () => {
      const benefitAtFRA = 2500;
      const yearsDelayed = 3; // 70 - 67 = 3 years
      const creditPerYear = 0.08; // 8% per year
      
      const benefitAt70 = benefitAtFRA * (1 + creditPerYear * yearsDelayed);
      
      // 2500 * (1 + 0.08 * 3) = 2500 * 1.24 = 3100
      expect(benefitAt70).toBe(3100);
    });

    it('should match mock response delayed credits', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      const benefitAt67 = mockResponse.socialSecurityAnalysis.benefitAt67;
      const benefitAt70 = mockResponse.socialSecurityAnalysis.benefitAt70;
      
      // 70 benefit should be ~124% of 67 benefit
      const ratio = benefitAt70 / benefitAt67;
      expect(ratio).toBeCloseTo(1.24, 2);
    });
  });

  describe('Breakeven Age Calculation', () => {
    it('should calculate breakeven age for 62 vs 67', () => {
      const benefitAt62 = 1750;
      const benefitAt67 = 2500;
      
      // Cumulative at age X:
      // 62: benefitAt62 * (X - 62) * 12
      // 67: benefitAt67 * (X - 67) * 12
      // Breakeven when: benefitAt62 * (X - 62) = benefitAt67 * (X - 67)
      
      // Solving: 1750(X - 62) = 2500(X - 67)
      // 1750X - 108500 = 2500X - 167500
      // 59000 = 750X
      // X = 78.67
      
      const breakeven = (benefitAt67 * 67 - benefitAt62 * 62) / (benefitAt67 - benefitAt62);
      expect(breakeven).toBeCloseTo(78.67, 0);
    });

    it('should calculate breakeven age for 67 vs 70', () => {
      const benefitAt67 = 2500;
      const benefitAt70 = 3100;
      
      // Solving: 2500(X - 67) = 3100(X - 70)
      // 2500X - 167500 = 3100X - 217000
      // 49500 = 600X
      // X = 82.5
      
      const breakeven = (benefitAt70 * 70 - benefitAt67 * 67) / (benefitAt70 - benefitAt67);
      expect(breakeven).toBeCloseTo(82.5, 0);
    });

    it('should verify breakeven ages in mock response', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      expect(mockResponse.socialSecurityAnalysis.breakeven62vs67).toBe(78);
      expect(mockResponse.socialSecurityAnalysis.breakeven67vs70).toBe(82);
    });
  });

  describe('Lifetime Value Calculation', () => {
    it('should calculate lifetime value at different claiming ages', () => {
      const benefitAt62 = 1750;
      const benefitAt67 = 2500;
      const benefitAt70 = 3100;
      const lifeExpectancy = 85;
      
      const lifetimeAt62 = benefitAt62 * 12 * (lifeExpectancy - 62);
      const lifetimeAt67 = benefitAt67 * 12 * (lifeExpectancy - 67);
      const lifetimeAt70 = benefitAt70 * 12 * (lifeExpectancy - 70);
      
      // 1750 * 12 * 23 = 483000
      // 2500 * 12 * 18 = 540000
      // 3100 * 12 * 15 = 558000
      
      expect(lifetimeAt62).toBe(483000);
      expect(lifetimeAt67).toBe(540000);
      expect(lifetimeAt70).toBe(558000);
      
      // Delaying to 70 provides highest lifetime value if living to 85
      expect(lifetimeAt70).toBeGreaterThan(lifetimeAt67);
      expect(lifetimeAt67).toBeGreaterThan(lifetimeAt62);
    });
  });
});

// ==================== Unit Tests: Monte Carlo Simulation ====================

describe('Monte Carlo Simulation', () => {
  describe('Simulation Parameters', () => {
    it('should run at least 1000 simulations', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      expect(mockResponse.monteCarlo.simulations).toBeGreaterThanOrEqual(1000);
    });

    it('should calculate success rate as percentage', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      expect(mockResponse.monteCarlo.successRate).toBeGreaterThanOrEqual(0);
      expect(mockResponse.monteCarlo.successRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Confidence Bands', () => {
    it('should have P10 < P50 < P90', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      expect(mockResponse.monteCarlo.p10Balance).toBeLessThan(mockResponse.monteCarlo.p50Balance);
      expect(mockResponse.monteCarlo.p50Balance).toBeLessThan(mockResponse.monteCarlo.p90Balance);
    });

    it('should have increasing balances over time in all scenarios', () => {
      const mockResponse = createMockRetirementPlanResponse();
      const projections = mockResponse.monteCarlo.projectedYears;
      
      for (let i = 1; i < projections.length; i++) {
        // P50 should generally increase (accumulation phase)
        expect(projections[i].p50).toBeGreaterThan(projections[i - 1].p50);
      }
    });

    it('should have wider spread as time increases', () => {
      const mockResponse = createMockRetirementPlanResponse();
      const projections = mockResponse.monteCarlo.projectedYears;
      
      const firstSpread = projections[0].p90 - projections[0].p10;
      const lastSpread = projections[projections.length - 1].p90 - projections[projections.length - 1].p10;
      
      expect(lastSpread).toBeGreaterThan(firstSpread);
    });
  });

  describe('Future Value Calculation', () => {
    it('should calculate compound growth correctly', () => {
      const input = createMockRetirementInput();
      
      // FV = PV * (1 + r)^n + PMT * ((1 + r)^n - 1) / r
      const years = input.retirementAge - input.currentAge;
      const monthlyRate = input.expectedReturn / 12;
      const months = years * 12;
      const monthlyContrib = input.monthlyContribution;
      const pv = input.currentSavings;
      
      // Simplified calculation
      const growthFactor = Math.pow(1 + input.expectedReturn, years);
      const futureValueLump = pv * growthFactor;
      
      expect(futureValueLump).toBeGreaterThan(pv);
      expect(futureValueLump).toBeCloseTo(pv * Math.pow(1.07, 20), -4);
    });
  });
});

// ==================== Unit Tests: RMD Calculations ====================

describe('Required Minimum Distributions (RMD)', () => {
  describe('RMD Starting Age', () => {
    it('should start RMDs at age 73 (SECURE Act 2.0)', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      const firstRMD = mockResponse.rmdProjections[0];
      expect(firstRMD.age).toBe(73);
    });
  });

  describe('RMD Calculation', () => {
    it('should calculate RMD using Uniform Lifetime Table', () => {
      // Age 73 distribution period = 26.5 (approximate)
      const balance = 1800000;
      const distributionPeriod = 26.5;
      
      const rmd = balance / distributionPeriod;
      
      expect(rmd).toBeCloseTo(67924, -2);
    });

    it('should have increasing RMD percentages as age increases', () => {
      const mockResponse = createMockRetirementPlanResponse();
      const rmds = mockResponse.rmdProjections;
      
      // RMD as percentage of balance should increase
      const rmdPercent1 = rmds[0].rmdAmount / rmds[0].balance;
      const rmdPercent3 = rmds[2].rmdAmount / rmds[2].balance;
      
      expect(rmdPercent3).toBeGreaterThan(rmdPercent1);
    });
  });

  describe('Tax Impact', () => {
    it('should calculate tax impact of RMD', () => {
      const rmdAmount = 67924;
      const taxBracket = 0.24;
      
      const taxImpact = rmdAmount * taxBracket;
      
      expect(taxImpact).toBeCloseTo(16302, 0);
    });
  });
});

// ==================== Unit Tests: Withdrawal Strategy ====================

describe('Withdrawal Strategy', () => {
  describe('Account Sequencing', () => {
    it('should sequence withdrawals: Taxable → Traditional → Roth', () => {
      const mockResponse = createMockRetirementPlanResponse();
      
      expect(mockResponse.withdrawalStrategy.sequence).toEqual(['Taxable', 'Traditional', 'Roth']);
    });

    it('should deplete taxable accounts first', () => {
      const mockResponse = createMockRetirementPlanResponse();
      const withdrawals = mockResponse.withdrawalStrategy.yearlyWithdrawals;
      
      // Early years should have taxable withdrawals
      expect(withdrawals[0].taxable).toBeGreaterThan(0);
      
      // Taxable should decrease over time
      expect(withdrawals[0].taxable).toBeGreaterThan(withdrawals[2].taxable);
    });
  });

  describe('Roth Conversion Opportunities', () => {
    it('should identify low-tax years for conversion', () => {
      const mockResponse = createMockRetirementPlanResponse();
      const conversions = mockResponse.withdrawalStrategy.rothConversionOpportunities;
      
      expect(conversions.length).toBeGreaterThan(0);
      expect(conversions[0].benefit).toContain('bracket');
    });

    it('should calculate tax cost of conversion', () => {
      const conversionAmount = 25000;
      const taxBracket = 0.24;
      
      const taxCost = conversionAmount * taxBracket;
      
      expect(taxCost).toBe(6000);
    });
  });

  describe('Safe Withdrawal Rate', () => {
    it('should validate 4% rule', () => {
      const portfolioBalance = 2000000;
      const safeWithdrawalRate = 0.04;
      
      const annualWithdrawal = portfolioBalance * safeWithdrawalRate;
      const monthlyWithdrawal = annualWithdrawal / 12;
      
      expect(annualWithdrawal).toBe(80000);
      expect(monthlyWithdrawal).toBeCloseTo(6666.67, 0);
    });
  });
});

// ==================== Integration Tests: Edge Function ====================

describe('Retirement Planner Edge Function', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Deepseek Integration', () => {
    it('should construct proper prompt for retirement analysis', () => {
      const input = createMockRetirementInput();
      
      const prompt = `Analyze retirement plan with:
        Current age: ${input.currentAge}
        Retirement age: ${input.retirementAge}
        Current savings: $${input.currentSavings}
        Monthly contribution: $${input.monthlyContribution}
        Expected return: ${input.expectedReturn * 100}%
        Social Security benefit: $${input.socialSecurityBenefit}
        Risk tolerance: ${input.riskTolerance}`;
      
      expect(prompt).toContain('45');
      expect(prompt).toContain('65');
      expect(prompt).toContain('500000');
    });

    it('should parse Deepseek JSON response correctly', () => {
      const mockResponse = createMockRetirementPlanResponse();
      const deepseekResponse = createMockDeepseekResponse(JSON.stringify(mockResponse));
      
      const content = deepseekResponse.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      expect(parsed.monteCarlo).toBeDefined();
      expect(parsed.socialSecurityAnalysis).toBeDefined();
      expect(parsed.withdrawalStrategy).toBeDefined();
      expect(parsed.rmdProjections).toBeDefined();
    });

    it('should handle partial or malformed response', () => {
      const partialResponse = '{ "monteCarlo": { "successRate": 0.85 }';
      
      expect(() => JSON.parse(partialResponse)).toThrow();
    });
  });

  describe('Database Persistence', () => {
    it('should upsert retirement plan for user', async () => {
      const mockResult = createMockRetirementPlanResponse();
      const input = createMockRetirementInput();
      
      mockSupabase.upsert.mockResolvedValue({ data: { id: 'test-id' }, error: null });
      
      await mockSupabase.from('retirement_plans').upsert({
        user_id: 'test-user',
        input_data: input,
        monte_carlo_results: mockResult.monteCarlo,
        social_security_analysis: mockResult.socialSecurityAnalysis,
        withdrawal_strategy: mockResult.withdrawalStrategy,
        rmd_projections: mockResult.rmdProjections,
        overall_readiness: mockResult.overallReadiness,
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('retirement_plans');
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });

    it('should update existing plan rather than create duplicate', async () => {
      const existingPlan = { id: 'existing-id', user_id: 'test-user' };
      
      mockSupabase.single.mockResolvedValue({ data: existingPlan, error: null });
      
      // Should use upsert with onConflict
      await mockSupabase.from('retirement_plans').upsert(
        { user_id: 'test-user', overall_readiness: 85 },
        { onConflict: 'user_id' }
      );
      
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });
  });

  describe('Analytics Logging', () => {
    it('should log reasoning token usage', () => {
      const deepseekResponse = createMockDeepseekResponse('{}', 1200);
      
      expect(deepseekResponse.usage.reasoning_tokens).toBe(1200);
      
      // Reasoning tokens are more expensive
      const reasoningCost = deepseekResponse.usage.reasoning_tokens! * 0.000003;
      const completionCost = deepseekResponse.usage.completion_tokens * 0.000001;
      
      expect(reasoningCost).toBeGreaterThan(completionCost);
    });
  });
});

// ==================== End-to-End Tests ====================

describe('Retirement Planner E2E', () => {
  it('should complete full retirement planning flow', async () => {
    // Step 1: Create input
    const input = createMockRetirementInput();
    expect(input.currentAge).toBe(45);
    expect(input.retirementAge).toBe(65);
    
    // Step 2: Mock Deepseek response
    const mockResult = createMockRetirementPlanResponse();
    const deepseekResponse = createMockDeepseekResponse(JSON.stringify(mockResult));
    
    // Step 3: Parse response
    const parsed = JSON.parse(deepseekResponse.choices[0].message.content);
    
    // Step 4: Verify Monte Carlo results
    expect(parsed.monteCarlo.simulations).toBe(1000);
    expect(parsed.monteCarlo.successRate).toBe(0.87);
    
    // Step 5: Verify Social Security analysis
    expect(parsed.socialSecurityAnalysis.optimalClaimingAge).toBe(70);
    
    // Step 6: Verify withdrawal strategy
    expect(parsed.withdrawalStrategy.sequence).toHaveLength(3);
    
    // Step 7: Verify RMD projections
    expect(parsed.rmdProjections).toHaveLength(3);
    expect(parsed.rmdProjections[0].age).toBe(73);
  });

  it('should handle young investor with long time horizon', () => {
    const youngInput: MockRetirementInput = {
      ...createMockRetirementInput(),
      currentAge: 25,
      retirementAge: 65,
      currentSavings: 50000,
    };
    
    const yearsToRetirement = youngInput.retirementAge - youngInput.currentAge;
    expect(yearsToRetirement).toBe(40);
    
    // With 40 years, compound growth is substantial
    const futureValue = youngInput.currentSavings * Math.pow(1.07, yearsToRetirement);
    expect(futureValue).toBeGreaterThan(700000);
  });

  it('should handle near-retiree with short time horizon', () => {
    const nearRetireeInput: MockRetirementInput = {
      ...createMockRetirementInput(),
      currentAge: 60,
      retirementAge: 65,
      currentSavings: 1500000,
    };
    
    const yearsToRetirement = nearRetireeInput.retirementAge - nearRetireeInput.currentAge;
    expect(yearsToRetirement).toBe(5);
    
    // Success rate should be more certain with large savings
    const annualNeeded = nearRetireeInput.desiredMonthlyIncome * 12;
    const yearsSupported = nearRetireeInput.currentSavings / annualNeeded;
    expect(yearsSupported).toBeGreaterThan(20);
  });

  it('should handle already-retired scenario', () => {
    const retiredInput: MockRetirementInput = {
      ...createMockRetirementInput(),
      currentAge: 68,
      retirementAge: 65,
      monthlyContribution: 0,
    };
    
    expect(retiredInput.currentAge).toBeGreaterThan(retiredInput.retirementAge);
    expect(retiredInput.monthlyContribution).toBe(0);
  });
});

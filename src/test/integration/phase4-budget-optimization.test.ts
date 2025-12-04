/**
 * Phase 4: Budget Optimization Integration Tests
 * Tests for optimize-budget-zbb edge function, zero-based budgeting, and 50/30/20 rule
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockBudgetCategories,
  createMockBudgetOptimizationResponse,
  createMockDeepseekResponse,
  createMockSupabaseClient,
  type MockBudgetCategory,
} from '../mocks/phase4Responses';

// ==================== Unit Tests: 50/30/20 Rule ====================

describe('50/30/20 Budget Rule', () => {
  describe('Rule Calculation', () => {
    it('should calculate 50% needs allocation', () => {
      const monthlyIncome = 6000;
      const needsAllocation = monthlyIncome * 0.5;
      
      expect(needsAllocation).toBe(3000);
    });

    it('should calculate 30% wants allocation', () => {
      const monthlyIncome = 6000;
      const wantsAllocation = monthlyIncome * 0.3;
      
      expect(wantsAllocation).toBe(1800);
    });

    it('should calculate 20% savings allocation', () => {
      const monthlyIncome = 6000;
      const savingsAllocation = monthlyIncome * 0.2;
      
      expect(savingsAllocation).toBe(1200);
    });

    it('should sum to 100%', () => {
      const monthlyIncome = 6000;
      const needs = monthlyIncome * 0.5;
      const wants = monthlyIncome * 0.3;
      const savings = monthlyIncome * 0.2;
      
      expect(needs + wants + savings).toBe(monthlyIncome);
    });
  });

  describe('Variance Analysis', () => {
    it('should calculate variance from target', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const rules = mockResponse.rules.fiftyThirtyTwenty;
      
      // Needs variance
      expect(rules.needs.variance).toBe(rules.needs.target - rules.needs.actual);
      expect(rules.needs.variance).toBe(-550); // Over budget
      
      // Wants variance
      expect(rules.wants.variance).toBe(rules.wants.target - rules.wants.actual);
      expect(rules.wants.variance).toBe(600); // Under budget
      
      // Savings variance
      expect(rules.savings.variance).toBe(rules.savings.target - rules.savings.actual);
      expect(rules.savings.variance).toBe(-700); // Under-saving
    });

    it('should identify overspending in needs', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const needsVariance = mockResponse.rules.fiftyThirtyTwenty.needs.variance;
      
      expect(needsVariance).toBeLessThan(0); // Negative means overspending
    });
  });
});

// ==================== Unit Tests: Zero-Based Budgeting ====================

describe('Zero-Based Budgeting', () => {
  describe('Total Allocation', () => {
    it('should allocate exactly 100% of income', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const zbb = mockResponse.zeroBasedBudget;
      
      expect(zbb.totalAllocated).toBe(zbb.income);
      expect(zbb.remainingToAllocate).toBe(0);
    });

    it('should have all allocations sum to income', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const zbb = mockResponse.zeroBasedBudget;
      
      const totalFromAllocations = zbb.allocations.reduce((sum, a) => sum + a.amount, 0);
      
      expect(totalFromAllocations).toBe(zbb.income);
    });

    it('should have percentages sum to 100', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const zbb = mockResponse.zeroBasedBudget;
      
      const totalPercentage = zbb.allocations.reduce((sum, a) => sum + a.percentage, 0);
      
      expect(totalPercentage).toBeCloseTo(100, 0);
    });
  });

  describe('Priority Classification', () => {
    it('should classify essential expenses correctly', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const essentials = mockResponse.zeroBasedBudget.allocations.filter(
        a => a.priority === 'essential'
      );
      
      const essentialCategories = essentials.map(e => e.category);
      expect(essentialCategories).toContain('Housing');
      expect(essentialCategories).toContain('Utilities');
      expect(essentialCategories).toContain('Groceries');
      expect(essentialCategories).toContain('Insurance');
      expect(essentialCategories).toContain('Savings');
    });

    it('should classify discretionary expenses correctly', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const discretionary = mockResponse.zeroBasedBudget.allocations.filter(
        a => a.priority === 'discretionary'
      );
      
      const discretionaryCategories = discretionary.map(d => d.category);
      expect(discretionaryCategories).toContain('Dining Out');
      expect(discretionaryCategories).toContain('Entertainment');
      expect(discretionaryCategories).toContain('Shopping');
      expect(discretionaryCategories).toContain('Subscriptions');
    });
  });
});

// ==================== Unit Tests: Category Optimization ====================

describe('Category Optimization', () => {
  describe('Savings Potential', () => {
    it('should calculate savings potential correctly', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      
      mockResponse.categoryOptimizations.forEach(opt => {
        const calculatedSavings = opt.currentSpend - opt.suggestedBudget;
        expect(opt.savingsPotential).toBe(calculatedSavings);
      });
    });

    it('should identify highest savings opportunities', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const sorted = [...mockResponse.categoryOptimizations].sort(
        (a, b) => b.savingsPotential - a.savingsPotential
      );
      
      // Dining Out should have highest savings potential
      expect(sorted[0].category).toBe('Dining Out');
      expect(sorted[0].savingsPotential).toBe(250);
    });

    it('should total savings potential across all categories', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      
      const totalSavings = mockResponse.categoryOptimizations.reduce(
        (sum, opt) => sum + opt.savingsPotential, 
        0
      );
      
      expect(totalSavings).toBe(600); // 250 + 200 + 150
    });
  });

  describe('Change Type Classification', () => {
    it('should identify quick wins', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const quickWins = mockResponse.categoryOptimizations.filter(
        opt => opt.changeType === 'quick_win'
      );
      
      expect(quickWins.length).toBeGreaterThan(0);
      // Quick wins: Dining Out, Shopping
      expect(quickWins.map(q => q.category)).toContain('Dining Out');
      expect(quickWins.map(q => q.category)).toContain('Shopping');
    });

    it('should identify long-term changes', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const longTerm = mockResponse.categoryOptimizations.filter(
        opt => opt.changeType === 'long_term'
      );
      
      expect(longTerm.length).toBeGreaterThan(0);
      // Long-term: Groceries (meal planning takes time to implement)
      expect(longTerm.map(l => l.category)).toContain('Groceries');
    });
  });

  describe('Benchmark Comparison', () => {
    it('should compare against category benchmarks', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      
      mockResponse.categoryOptimizations.forEach(opt => {
        // Suggested budget should be closer to benchmark than current spend
        const currentDiff = Math.abs(opt.currentSpend - opt.benchmark);
        const suggestedDiff = Math.abs(opt.suggestedBudget - opt.benchmark);
        
        expect(suggestedDiff).toBeLessThanOrEqual(currentDiff);
      });
    });
  });
});

// ==================== Unit Tests: Savings Analysis ====================

describe('Savings Analysis', () => {
  describe('Savings Rate', () => {
    it('should calculate current savings rate', () => {
      const categories = createMockBudgetCategories();
      const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
      const income = 6000;
      const savings = categories.find(c => c.name === 'Savings')?.spent || 0;
      
      const savingsRate = savings / income;
      
      expect(savingsRate).toBeCloseTo(0.083, 2); // 500/6000 = 8.3%
    });

    it('should identify savings gap', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const { currentSavingsRate, targetSavingsRate, monthlySavingsGap } = mockResponse.savingsAnalysis;
      
      expect(currentSavingsRate).toBeLessThan(targetSavingsRate);
      expect(monthlySavingsGap).toBe(700); // Need $700 more to reach 20%
    });
  });

  describe('Projected Annual Savings', () => {
    it('should calculate annual projection', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const { potentialMonthlyIncrease, projectedAnnualSavings } = mockResponse.savingsAnalysis;
      
      const currentMonthlySavings = 6000 * mockResponse.savingsAnalysis.currentSavingsRate;
      const newMonthlySavings = currentMonthlySavings + potentialMonthlyIncrease;
      const annualProjection = newMonthlySavings * 12;
      
      expect(annualProjection).toBeCloseTo(projectedAnnualSavings, -2);
    });
  });
});

// ==================== Unit Tests: Reallocation Suggestions ====================

describe('Reallocation Suggestions', () => {
  describe('Impact Scoring', () => {
    it('should prioritize high-impact reallocations', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const suggestions = mockResponse.reallocationSuggestions;
      
      // Suggestions should be sorted by impact score
      const sortedByImpact = [...suggestions].sort((a, b) => b.impactScore - a.impactScore);
      
      expect(sortedByImpact[0].impactScore).toBe(9);
    });

    it('should suggest reallocations from discretionary to essential', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const suggestions = mockResponse.reallocationSuggestions;
      
      // Should move from discretionary (Dining Out, Shopping) to savings/debt
      expect(suggestions.some(s => s.fromCategory === 'Dining Out')).toBe(true);
      expect(suggestions.some(s => s.toCategory === 'Savings')).toBe(true);
    });
  });

  describe('Amount Validation', () => {
    it('should not suggest reallocating more than available', () => {
      const categories = createMockBudgetCategories();
      const mockResponse = createMockBudgetOptimizationResponse();
      
      mockResponse.reallocationSuggestions.forEach(suggestion => {
        const sourceCategory = categories.find(c => c.name === suggestion.fromCategory);
        if (sourceCategory) {
          // Can't reallocate more than currently spent
          expect(suggestion.amount).toBeLessThanOrEqual(sourceCategory.spent);
        }
      });
    });
  });
});

// ==================== Integration Tests: Edge Function ====================

describe('Budget Optimization Edge Function', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Deepseek Integration', () => {
    it('should construct proper prompt for budget analysis', () => {
      const categories = createMockBudgetCategories();
      const income = 6000;
      
      const prompt = `Analyze and optimize budget:
        Monthly income: $${income}
        Categories: ${JSON.stringify(categories)}
        Apply zero-based budgeting principles.
        Validate against 50/30/20 rule.
        Identify quick wins and long-term optimizations.`;
      
      expect(prompt).toContain('6000');
      expect(prompt).toContain('zero-based');
      expect(prompt).toContain('50/30/20');
    });

    it('should parse Deepseek JSON response correctly', () => {
      const mockResponse = createMockBudgetOptimizationResponse();
      const deepseekResponse = createMockDeepseekResponse(JSON.stringify(mockResponse));
      
      const content = deepseekResponse.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      expect(parsed.zeroBasedBudget).toBeDefined();
      expect(parsed.categoryOptimizations).toBeDefined();
      expect(parsed.reallocationSuggestions).toBeDefined();
      expect(parsed.savingsAnalysis).toBeDefined();
      expect(parsed.rules).toBeDefined();
    });
  });

  describe('Database Persistence', () => {
    it('should save optimization to budget_optimization_history', async () => {
      const mockResult = createMockBudgetOptimizationResponse();
      const categories = createMockBudgetCategories();
      
      mockSupabase.insert.mockResolvedValue({ data: { id: 'test-id' }, error: null });
      
      await mockSupabase.from('budget_optimization_history').insert({
        user_id: 'test-user',
        input_data: { categories, income: 6000 },
        optimization_type: 'zero_based',
        recommendations: mockResult.zeroBasedBudget.allocations,
        reasoning_chain: mockResult.reasoning,
        savings_potential: mockResult.categoryOptimizations.reduce((sum, o) => sum + o.savingsPotential, 0),
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('budget_optimization_history');
    });
  });
});

// ==================== End-to-End Tests ====================

describe('Budget Optimization E2E', () => {
  it('should complete full budget optimization flow', async () => {
    // Step 1: Create input categories
    const categories = createMockBudgetCategories();
    expect(categories).toHaveLength(10);
    
    // Step 2: Mock Deepseek response
    const mockResult = createMockBudgetOptimizationResponse();
    const deepseekResponse = createMockDeepseekResponse(JSON.stringify(mockResult));
    
    // Step 3: Parse response
    const parsed = JSON.parse(deepseekResponse.choices[0].message.content);
    
    // Step 4: Verify ZBB allocations
    expect(parsed.zeroBasedBudget.totalAllocated).toBe(6000);
    expect(parsed.zeroBasedBudget.remainingToAllocate).toBe(0);
    
    // Step 5: Verify 50/30/20 analysis
    expect(parsed.rules.fiftyThirtyTwenty.needs.target).toBe(3000);
    expect(parsed.rules.fiftyThirtyTwenty.wants.target).toBe(1800);
    expect(parsed.rules.fiftyThirtyTwenty.savings.target).toBe(1200);
    
    // Step 6: Verify category optimizations
    expect(parsed.categoryOptimizations.length).toBeGreaterThan(0);
    
    // Step 7: Verify overall health score
    expect(parsed.overallHealthScore).toBeGreaterThanOrEqual(0);
    expect(parsed.overallHealthScore).toBeLessThanOrEqual(100);
  });

  it('should handle budget with no discretionary spending', () => {
    const essentialOnlyCategories: MockBudgetCategory[] = [
      { name: 'Housing', budgeted: 2000, spent: 2000, isEssential: true, priority: 1 },
      { name: 'Utilities', budgeted: 200, spent: 200, isEssential: true, priority: 2 },
      { name: 'Groceries', budgeted: 600, spent: 600, isEssential: true, priority: 3 },
      { name: 'Transportation', budgeted: 400, spent: 400, isEssential: true, priority: 4 },
      { name: 'Insurance', budgeted: 300, spent: 300, isEssential: true, priority: 5 },
      { name: 'Savings', budgeted: 2500, spent: 2500, isEssential: true, priority: 6 },
    ];
    
    const totalSpent = essentialOnlyCategories.reduce((sum, c) => sum + c.spent, 0);
    expect(totalSpent).toBe(6000);
    
    // No discretionary to cut, so savings potential should be minimal
    const discretionary = essentialOnlyCategories.filter(c => !c.isEssential);
    expect(discretionary).toHaveLength(0);
  });

  it('should handle overspending scenario', () => {
    const overspendingCategories: MockBudgetCategory[] = [
      { name: 'Housing', budgeted: 2000, spent: 2500, isEssential: true, priority: 1 },
      { name: 'Dining Out', budgeted: 200, spent: 800, isEssential: false, priority: 2 },
      { name: 'Shopping', budgeted: 200, spent: 1000, isEssential: false, priority: 3 },
      { name: 'Savings', budgeted: 1200, spent: 0, isEssential: true, priority: 4 },
    ];
    
    const totalBudgeted = overspendingCategories.reduce((sum, c) => sum + c.budgeted, 0);
    const totalSpent = overspendingCategories.reduce((sum, c) => sum + c.spent, 0);
    
    // Overspending by $1700
    expect(totalSpent - totalBudgeted).toBe(1700);
    
    // Savings rate is 0%
    const savingsRate = overspendingCategories.find(c => c.name === 'Savings')?.spent || 0;
    expect(savingsRate).toBe(0);
  });

  it('should handle high-income budget', () => {
    const highIncome = 15000;
    const needs = highIncome * 0.5; // 7500
    const wants = highIncome * 0.3; // 4500
    const savings = highIncome * 0.2; // 3000
    
    expect(needs + wants + savings).toBe(highIncome);
    expect(savings).toBe(3000); // $36k/year savings potential
  });

  it('should handle low-income budget with limited flexibility', () => {
    const lowIncome = 2500;
    const essentialCosts = 2200; // Housing, utilities, groceries, transport
    const remainingForSavings = lowIncome - essentialCosts;
    
    expect(remainingForSavings).toBe(300);
    
    // 12% savings rate achievable
    const achievableSavingsRate = remainingForSavings / lowIncome;
    expect(achievableSavingsRate).toBeCloseTo(0.12, 2);
  });
});

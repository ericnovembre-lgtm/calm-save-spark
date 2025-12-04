/**
 * Phase 4: Advanced Financial Intelligence - Mock Factories
 * Mock responses for portfolio optimization, retirement planning, and budget optimization
 */

import { vi } from 'vitest';

// ==================== Portfolio Optimization Mocks ====================

export interface MockPortfolioHolding {
  symbol: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  sector: string;
  assetClass: string;
}

export interface MockPortfolioOptimizationResponse {
  riskMetrics: {
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    volatility: number;
    beta: number;
  };
  rebalancingRecommendations: Array<{
    symbol: string;
    currentWeight: number;
    targetWeight: number;
    action: 'buy' | 'sell' | 'hold';
    shares: number;
    rationale: string;
  }>;
  taxLossHarvesting: Array<{
    symbol: string;
    unrealizedLoss: number;
    taxSavings: number;
    replacementSymbol: string;
    washSaleRisk: boolean;
    washSaleDate?: string;
  }>;
  overallScore: number;
  reasoning: string;
}

export function createMockPortfolioHoldings(): MockPortfolioHolding[] {
  return [
    { symbol: 'AAPL', shares: 100, costBasis: 150, currentPrice: 175, sector: 'Technology', assetClass: 'US Large Cap' },
    { symbol: 'MSFT', shares: 50, costBasis: 280, currentPrice: 350, sector: 'Technology', assetClass: 'US Large Cap' },
    { symbol: 'VTI', shares: 200, costBasis: 200, currentPrice: 220, sector: 'Broad Market', assetClass: 'US Total Market' },
    { symbol: 'BND', shares: 150, costBasis: 80, currentPrice: 75, sector: 'Fixed Income', assetClass: 'US Bonds' },
    { symbol: 'VXUS', shares: 100, costBasis: 55, currentPrice: 52, sector: 'International', assetClass: 'International Developed' },
    { symbol: 'TSLA', shares: 25, costBasis: 300, currentPrice: 250, sector: 'Technology', assetClass: 'US Large Cap' },
  ];
}

export function createMockPortfolioOptimizationResponse(): MockPortfolioOptimizationResponse {
  return {
    riskMetrics: {
      sharpeRatio: 1.45,
      sortinoRatio: 1.82,
      maxDrawdown: 0.18,
      volatility: 0.15,
      beta: 1.05,
    },
    rebalancingRecommendations: [
      {
        symbol: 'AAPL',
        currentWeight: 0.22,
        targetWeight: 0.15,
        action: 'sell',
        shares: 30,
        rationale: 'Overweight in single stock; reduce concentration risk',
      },
      {
        symbol: 'BND',
        currentWeight: 0.08,
        targetWeight: 0.15,
        action: 'buy',
        shares: 100,
        rationale: 'Increase fixed income allocation for risk balance',
      },
      {
        symbol: 'VXUS',
        currentWeight: 0.06,
        targetWeight: 0.10,
        action: 'buy',
        shares: 75,
        rationale: 'Increase international diversification',
      },
    ],
    taxLossHarvesting: [
      {
        symbol: 'BND',
        unrealizedLoss: 750,
        taxSavings: 225,
        replacementSymbol: 'AGG',
        washSaleRisk: false,
      },
      {
        symbol: 'VXUS',
        unrealizedLoss: 300,
        taxSavings: 90,
        replacementSymbol: 'VEA',
        washSaleRisk: false,
      },
      {
        symbol: 'TSLA',
        unrealizedLoss: 1250,
        taxSavings: 375,
        replacementSymbol: 'RIVN',
        washSaleRisk: true,
        washSaleDate: '2024-02-15',
      },
    ],
    overallScore: 78,
    reasoning: 'Portfolio shows moderate concentration risk in technology sector. Recommend rebalancing to increase fixed income and international exposure. Tax-loss harvesting opportunities available in BND, VXUS, and TSLA positions.',
  };
}

// ==================== Retirement Planner Mocks ====================

export interface MockRetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
  socialSecurityBenefit: number;
  desiredMonthlyIncome: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  taxBracket: number;
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance: number;
}

export interface MockRetirementPlanResponse {
  monteCarlo: {
    simulations: number;
    successRate: number;
    medianEndingBalance: number;
    p10Balance: number;
    p50Balance: number;
    p90Balance: number;
    projectedYears: Array<{
      year: number;
      age: number;
      p10: number;
      p50: number;
      p90: number;
    }>;
  };
  socialSecurityAnalysis: {
    benefitAt62: number;
    benefitAt67: number;
    benefitAt70: number;
    breakeven62vs67: number;
    breakeven67vs70: number;
    optimalClaimingAge: number;
    lifetimeValueAt62: number;
    lifetimeValueAt67: number;
    lifetimeValueAt70: number;
  };
  withdrawalStrategy: {
    sequence: string[];
    yearlyWithdrawals: Array<{
      year: number;
      traditional: number;
      roth: number;
      taxable: number;
      totalTax: number;
    }>;
    rothConversionOpportunities: Array<{
      year: number;
      amount: number;
      taxCost: number;
      benefit: string;
    }>;
  };
  rmdProjections: Array<{
    age: number;
    year: number;
    balance: number;
    rmdAmount: number;
    taxImpact: number;
  }>;
  recommendations: string[];
  overallReadiness: number;
}

export function createMockRetirementInput(): MockRetirementInput {
  return {
    currentAge: 45,
    retirementAge: 65,
    currentSavings: 500000,
    monthlyContribution: 2000,
    expectedReturn: 0.07,
    inflationRate: 0.025,
    socialSecurityBenefit: 2500,
    desiredMonthlyIncome: 6000,
    riskTolerance: 'moderate',
    taxBracket: 0.24,
    traditionalBalance: 350000,
    rothBalance: 100000,
    taxableBalance: 50000,
  };
}

export function createMockRetirementPlanResponse(): MockRetirementPlanResponse {
  return {
    monteCarlo: {
      simulations: 1000,
      successRate: 0.87,
      medianEndingBalance: 2150000,
      p10Balance: 1200000,
      p50Balance: 2150000,
      p90Balance: 3800000,
      projectedYears: [
        { year: 2024, age: 45, p10: 500000, p50: 520000, p90: 540000 },
        { year: 2029, age: 50, p10: 650000, p50: 750000, p90: 850000 },
        { year: 2034, age: 55, p10: 850000, p50: 1050000, p90: 1300000 },
        { year: 2039, age: 60, p10: 1000000, p50: 1450000, p90: 1950000 },
        { year: 2044, age: 65, p10: 1200000, p50: 2150000, p90: 3800000 },
      ],
    },
    socialSecurityAnalysis: {
      benefitAt62: 1750,
      benefitAt67: 2500,
      benefitAt70: 3100,
      breakeven62vs67: 78,
      breakeven67vs70: 82,
      optimalClaimingAge: 70,
      lifetimeValueAt62: 378000,
      lifetimeValueAt67: 450000,
      lifetimeValueAt70: 483600,
    },
    withdrawalStrategy: {
      sequence: ['Taxable', 'Traditional', 'Roth'],
      yearlyWithdrawals: [
        { year: 2044, traditional: 40000, roth: 0, taxable: 32000, totalTax: 9600 },
        { year: 2045, traditional: 45000, roth: 0, taxable: 27000, totalTax: 10800 },
        { year: 2046, traditional: 50000, roth: 0, taxable: 22000, totalTax: 12000 },
      ],
      rothConversionOpportunities: [
        { year: 2024, amount: 25000, taxCost: 6000, benefit: 'Fill 24% bracket before retirement' },
        { year: 2025, amount: 25000, taxCost: 6000, benefit: 'Continue tax-efficient conversion ladder' },
      ],
    },
    rmdProjections: [
      { age: 73, year: 2052, balance: 1800000, rmdAmount: 67924, taxImpact: 16302 },
      { age: 74, year: 2053, balance: 1850000, rmdAmount: 73810, taxImpact: 17714 },
      { age: 75, year: 2054, balance: 1900000, rmdAmount: 78512, taxImpact: 18843 },
    ],
    recommendations: [
      'Consider delaying Social Security to age 70 for maximum lifetime benefit',
      'Roth conversion opportunities exist in years 2024-2025 to reduce future RMDs',
      'Current savings rate on track for 87% success probability',
      'Consider increasing international diversification for risk management',
    ],
    overallReadiness: 82,
  };
}

// ==================== Budget Optimization Mocks ====================

export interface MockBudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  isEssential: boolean;
  priority: number;
}

export interface MockBudgetOptimizationResponse {
  zeroBasedBudget: {
    income: number;
    allocations: Array<{
      category: string;
      amount: number;
      percentage: number;
      priority: 'essential' | 'important' | 'discretionary';
      rationale: string;
    }>;
    totalAllocated: number;
    remainingToAllocate: number;
  };
  categoryOptimizations: Array<{
    category: string;
    currentSpend: number;
    suggestedBudget: number;
    savingsPotential: number;
    benchmark: number;
    changeType: 'quick_win' | 'long_term' | 'maintain';
    suggestions: string[];
  }>;
  reallocationSuggestions: Array<{
    fromCategory: string;
    toCategory: string;
    amount: number;
    rationale: string;
    impactScore: number;
  }>;
  savingsAnalysis: {
    currentSavingsRate: number;
    targetSavingsRate: number;
    monthlySavingsGap: number;
    potentialMonthlyIncrease: number;
    projectedAnnualSavings: number;
  };
  rules: {
    fiftyThirtyTwenty: {
      needs: { target: number; actual: number; variance: number };
      wants: { target: number; actual: number; variance: number };
      savings: { target: number; actual: number; variance: number };
    };
  };
  overallHealthScore: number;
  reasoning: string;
}

export function createMockBudgetCategories(): MockBudgetCategory[] {
  return [
    { name: 'Housing', budgeted: 2000, spent: 2000, isEssential: true, priority: 1 },
    { name: 'Utilities', budgeted: 200, spent: 180, isEssential: true, priority: 2 },
    { name: 'Groceries', budgeted: 600, spent: 650, isEssential: true, priority: 3 },
    { name: 'Transportation', budgeted: 400, spent: 420, isEssential: true, priority: 4 },
    { name: 'Insurance', budgeted: 300, spent: 300, isEssential: true, priority: 5 },
    { name: 'Dining Out', budgeted: 300, spent: 450, isEssential: false, priority: 6 },
    { name: 'Entertainment', budgeted: 200, spent: 280, isEssential: false, priority: 7 },
    { name: 'Shopping', budgeted: 200, spent: 350, isEssential: false, priority: 8 },
    { name: 'Subscriptions', budgeted: 100, spent: 120, isEssential: false, priority: 9 },
    { name: 'Savings', budgeted: 500, spent: 500, isEssential: true, priority: 10 },
  ];
}

export function createMockBudgetOptimizationResponse(): MockBudgetOptimizationResponse {
  return {
    zeroBasedBudget: {
      income: 6000,
      allocations: [
        { category: 'Housing', amount: 2000, percentage: 33.3, priority: 'essential', rationale: 'Fixed cost, within 30% guideline' },
        { category: 'Utilities', amount: 180, percentage: 3, priority: 'essential', rationale: 'Essential services' },
        { category: 'Groceries', amount: 500, percentage: 8.3, priority: 'essential', rationale: 'Reduced from $650 actual; meal planning recommended' },
        { category: 'Transportation', amount: 350, percentage: 5.8, priority: 'essential', rationale: 'Optimized from $420' },
        { category: 'Insurance', amount: 300, percentage: 5, priority: 'essential', rationale: 'Necessary protection' },
        { category: 'Dining Out', amount: 200, percentage: 3.3, priority: 'discretionary', rationale: 'Reduced from $450; significant savings opportunity' },
        { category: 'Entertainment', amount: 150, percentage: 2.5, priority: 'discretionary', rationale: 'Reduced from $280' },
        { category: 'Shopping', amount: 150, percentage: 2.5, priority: 'discretionary', rationale: 'Reduced from $350; budget before buying' },
        { category: 'Subscriptions', amount: 70, percentage: 1.2, priority: 'discretionary', rationale: 'Audit and cancel unused' },
        { category: 'Savings', amount: 1200, percentage: 20, priority: 'essential', rationale: 'Increased to meet 20% target' },
        { category: 'Emergency Fund', amount: 300, percentage: 5, priority: 'essential', rationale: 'Build 3-6 month cushion' },
        { category: 'Debt Payment', amount: 600, percentage: 10, priority: 'essential', rationale: 'Accelerate debt payoff' },
      ],
      totalAllocated: 6000,
      remainingToAllocate: 0,
    },
    categoryOptimizations: [
      {
        category: 'Dining Out',
        currentSpend: 450,
        suggestedBudget: 200,
        savingsPotential: 250,
        benchmark: 180,
        changeType: 'quick_win',
        suggestions: ['Cook at home 3 more nights per week', 'Use restaurant deal apps', 'Pack lunch for work'],
      },
      {
        category: 'Shopping',
        currentSpend: 350,
        suggestedBudget: 150,
        savingsPotential: 200,
        benchmark: 140,
        changeType: 'quick_win',
        suggestions: ['Implement 24-hour rule before purchases', 'Unsubscribe from retail emails', 'Create wish list and wait for sales'],
      },
      {
        category: 'Groceries',
        currentSpend: 650,
        suggestedBudget: 500,
        savingsPotential: 150,
        benchmark: 480,
        changeType: 'long_term',
        suggestions: ['Meal plan weekly', 'Buy generic brands', 'Use grocery pickup to avoid impulse buys'],
      },
    ],
    reallocationSuggestions: [
      {
        fromCategory: 'Dining Out',
        toCategory: 'Savings',
        amount: 250,
        rationale: 'Redirect restaurant spending to emergency fund',
        impactScore: 9,
      },
      {
        fromCategory: 'Shopping',
        toCategory: 'Debt Payment',
        amount: 200,
        rationale: 'Accelerate debt payoff to reduce interest',
        impactScore: 8,
      },
    ],
    savingsAnalysis: {
      currentSavingsRate: 0.083,
      targetSavingsRate: 0.20,
      monthlySavingsGap: 700,
      potentialMonthlyIncrease: 600,
      projectedAnnualSavings: 14400,
    },
    rules: {
      fiftyThirtyTwenty: {
        needs: { target: 3000, actual: 3550, variance: -550 },
        wants: { target: 1800, actual: 1200, variance: 600 },
        savings: { target: 1200, actual: 500, variance: -700 },
      },
    },
    overallHealthScore: 62,
    reasoning: 'Budget shows overspending in discretionary categories (dining, shopping) while under-saving. Quick wins available by reducing dining out and shopping. Implement 50/30/20 rule for better balance.',
  };
}

// ==================== Deepseek API Mocks ====================

export interface MockDeepseekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    reasoning_tokens?: number;
  };
}

export function createMockDeepseekResponse(content: string, reasoningTokens = 500): MockDeepseekResponse {
  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'deepseek-reasoner',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
          reasoning_content: 'Step-by-step reasoning process...',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 250,
      completion_tokens: 800,
      total_tokens: 1050,
      reasoning_tokens: reasoningTokens,
    },
  };
}

// ==================== Quota State Mocks ====================

export interface MockQuotaState {
  requests_remaining_rpm: number;
  requests_limit_rpm: number;
  requests_reset_at: string;
  tokens_remaining_tpm: number;
  tokens_limit_tpm: number;
  tokens_reset_at: string;
  circuit_state: 'closed' | 'open' | 'half-open';
  circuit_opened_at: string | null;
  consecutive_failures: number;
  avg_latency_ms: number;
  latency_samples: number;
  reasoning_tokens_used: number;
  total_cost_estimate: number;
  last_request_at: string;
  updated_at: string;
}

export function createMockQuotaState(overrides: Partial<MockQuotaState> = {}): MockQuotaState {
  return {
    requests_remaining_rpm: 50,
    requests_limit_rpm: 60,
    requests_reset_at: new Date(Date.now() + 60000).toISOString(),
    tokens_remaining_tpm: 80000,
    tokens_limit_tpm: 100000,
    tokens_reset_at: new Date(Date.now() + 60000).toISOString(),
    circuit_state: 'closed',
    circuit_opened_at: null,
    consecutive_failures: 0,
    avg_latency_ms: 450,
    latency_samples: 100,
    reasoning_tokens_used: 5000,
    total_cost_estimate: 0.15,
    last_request_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockQuotaStateAggressive(): MockQuotaState {
  return createMockQuotaState({
    requests_remaining_rpm: 55,
    tokens_remaining_tpm: 85000,
  });
}

export function createMockQuotaStateModerate(): MockQuotaState {
  return createMockQuotaState({
    requests_remaining_rpm: 30,
    tokens_remaining_tpm: 50000,
  });
}

export function createMockQuotaStateConservative(): MockQuotaState {
  return createMockQuotaState({
    requests_remaining_rpm: 12,
    tokens_remaining_tpm: 15000,
  });
}

export function createMockQuotaStateCritical(): MockQuotaState {
  return createMockQuotaState({
    requests_remaining_rpm: 3,
    tokens_remaining_tpm: 5000,
    circuit_state: 'half-open',
  });
}

export function createMockQuotaStateCircuitOpen(): MockQuotaState {
  return createMockQuotaState({
    circuit_state: 'open',
    circuit_opened_at: new Date(Date.now() - 30000).toISOString(),
    consecutive_failures: 3,
  });
}

// ==================== Supabase Mock Helpers ====================

export function createMockSupabaseClient() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    rpc: vi.fn(),
  };
}

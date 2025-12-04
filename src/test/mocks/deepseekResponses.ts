/**
 * Mock responses for Deepseek API testing
 */

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

export function createMockDeepseekResponse(overrides?: Partial<MockDeepseekResponse>): MockDeepseekResponse {
  return {
    id: 'chatcmpl-mock-' + Math.random().toString(36).substring(7),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'deepseek-reasoner',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'This is a mock response.',
          reasoning_content: 'Step 1: Analyzed the input.\nStep 2: Calculated the result.',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 150,
      completion_tokens: 200,
      total_tokens: 350,
      reasoning_tokens: 100,
    },
    ...overrides,
  };
}

export function createMockReasoningChain(steps: number = 5): string[] {
  return Array.from({ length: steps }, (_, i) => 
    `Step ${i + 1}: ${['Analyzing input data', 'Calculating interest rates', 'Comparing strategies', 'Optimizing allocation', 'Generating final recommendation'][i % 5]}`
  );
}

export interface MockDebtOptimizationResult {
  optimalAllocations: Array<{
    debtId: string;
    debtName: string;
    minimumPayment: number;
    extraPayment: number;
    totalPayment: number;
    interestSaved: number;
    monthsToPayoff: number;
  }>;
  totalInterestSaved: number;
  totalPayoffMonths: number;
  npvAnalysis: {
    presentValueSavings: number;
    futureValueSavings: number;
    effectiveRate: number;
  };
  sensitivityMatrix: Array<{
    extraPaymentAmount: number;
    monthsSaved: number;
    interestSaved: number;
  }>;
  hybridStrategy: {
    strategy: string;
    description: string;
    steps: string[];
  };
  reasoningChain: string[];
  confidence: number;
}

export function createMockDebtOptimization(
  debts: Array<{ id: string; name: string; balance: number; interestRate: number; minimumPayment: number }>,
  extraPayment: number
): MockDebtOptimizationResult {
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  
  const allocations = sortedDebts.map((debt, index) => ({
    debtId: debt.id,
    debtName: debt.name,
    minimumPayment: debt.minimumPayment,
    extraPayment: index === 0 ? extraPayment : 0,
    totalPayment: debt.minimumPayment + (index === 0 ? extraPayment : 0),
    interestSaved: Math.round(debt.balance * (debt.interestRate / 100) * 0.3),
    monthsToPayoff: Math.ceil(debt.balance / (debt.minimumPayment + (index === 0 ? extraPayment : 0))),
  }));

  const totalInterestSaved = allocations.reduce((sum, a) => sum + a.interestSaved, 0);

  return {
    optimalAllocations: allocations,
    totalInterestSaved,
    totalPayoffMonths: Math.max(...allocations.map(a => a.monthsToPayoff)),
    npvAnalysis: {
      presentValueSavings: totalInterestSaved * 0.95,
      futureValueSavings: totalInterestSaved * 1.05,
      effectiveRate: 5.5,
    },
    sensitivityMatrix: [
      { extraPaymentAmount: 50, monthsSaved: 2, interestSaved: totalInterestSaved * 0.2 },
      { extraPaymentAmount: 100, monthsSaved: 4, interestSaved: totalInterestSaved * 0.4 },
      { extraPaymentAmount: 200, monthsSaved: 7, interestSaved: totalInterestSaved * 0.7 },
      { extraPaymentAmount: 500, monthsSaved: 12, interestSaved: totalInterestSaved * 1.2 },
    ],
    hybridStrategy: {
      strategy: 'avalanche',
      description: 'Focus extra payments on highest interest debt first',
      steps: sortedDebts.map((d, i) => `Step ${i + 1}: Pay off ${d.name} (${d.interestRate}% APR)`),
    },
    reasoningChain: createMockReasoningChain(5),
    confidence: 0.92,
  };
}

export interface MockMonteCarloExplanation {
  narrative: string;
  keyInsights: string[];
  riskAssessment: {
    level: 'low' | 'moderate' | 'high' | 'critical';
    factors: string[];
  };
  sensitivityAnalysis: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
  milestones: Array<{
    year: number;
    projectedValue: number;
    confidence: number;
  }>;
}

export function createMockMonteCarloExplanation(): MockMonteCarloExplanation {
  return {
    narrative: 'Based on 1,000 Monte Carlo simulations, your financial plan shows a 75% probability of reaching your retirement goal. The primary drivers of uncertainty are market volatility and savings rate consistency.',
    keyInsights: [
      'Increasing your savings rate by 2% would improve success probability to 82%',
      'The first 10 years of contributions have the highest impact due to compound growth',
      'A market correction in years 5-10 would have moderate impact on final outcomes',
    ],
    riskAssessment: {
      level: 'moderate',
      factors: [
        'Market volatility (18% assumed) is the primary risk factor',
        'Inflation at 3% may erode purchasing power if not adjusted',
        'Job stability affects contribution consistency',
      ],
    },
    sensitivityAnalysis: [
      { factor: 'Savings Rate', impact: 0.35, direction: 'positive' },
      { factor: 'Market Return', impact: 0.30, direction: 'positive' },
      { factor: 'Inflation', impact: -0.15, direction: 'negative' },
      { factor: 'Time Horizon', impact: 0.20, direction: 'positive' },
    ],
    milestones: [
      { year: 2030, projectedValue: 150000, confidence: 0.85 },
      { year: 2040, projectedValue: 450000, confidence: 0.78 },
      { year: 2050, projectedValue: 750000, confidence: 0.72 },
      { year: 2054, projectedValue: 850000, confidence: 0.75 },
    ],
  };
}

// Stream chunk mock for testing streaming responses
export function createMockStreamChunk(content: string, reasoningContent?: string): string {
  const chunk = {
    id: 'chatcmpl-mock-stream',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'deepseek-reasoner',
    choices: [
      {
        index: 0,
        delta: {
          content,
          ...(reasoningContent && { reasoning_content: reasoningContent }),
        },
        finish_reason: null,
      },
    ],
  };
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

export function createMockStreamEnd(): string {
  return 'data: [DONE]\n\n';
}

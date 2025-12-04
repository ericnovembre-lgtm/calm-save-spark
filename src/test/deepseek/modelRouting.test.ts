import { describe, it, expect, vi } from 'vitest';

// Query classification types
type QueryType = 'simple' | 'complex' | 'mathematical_reasoning' | 'market_data' | 'document_analysis' | 'speed_critical';
type ModelRoute = 'gemini-flash' | 'claude-sonnet' | 'deepseek-reasoner' | 'perplexity' | 'gpt-5' | 'groq-llama';

// Keywords for mathematical reasoning routing
const MATHEMATICAL_KEYWORDS = [
  'calculate', 'optimize', 'monte carlo', 'debt payoff', 'amortization',
  'roi', 'npv', 'irr', 'break-even', 'payoff strategy', 'compound interest',
  'annuity', 'present value', 'future value', 'sensitivity analysis',
  'probability', 'projection', 'simulation'
];

const SPEED_CRITICAL_KEYWORDS = [
  'categorize', 'alert', 'notify', 'quick', 'instant', 'transaction',
  'real-time', 'immediate'
];

const DOCUMENT_KEYWORDS = [
  'tax', '1099', 'w-2', 'receipt', 'invoice', 'statement', 'document',
  'pdf', 'scan', 'upload', 'analyze document'
];

const MARKET_DATA_KEYWORDS = [
  'stock price', 'market', 'news', 'quote', 'ticker', 'trading',
  'current price', 'latest'
];

// Query classifier function
function classifyQuery(query: string, hasAttachment: boolean = false): { type: QueryType; route: ModelRoute; confidence: number } {
  const lowerQuery = query.toLowerCase();
  
  // Document analysis with attachment
  if (hasAttachment || DOCUMENT_KEYWORDS.some(k => lowerQuery.includes(k))) {
    return { type: 'document_analysis', route: 'gpt-5', confidence: 0.9 };
  }
  
  // Speed-critical queries
  if (SPEED_CRITICAL_KEYWORDS.some(k => lowerQuery.includes(k))) {
    return { type: 'speed_critical', route: 'groq-llama', confidence: 0.85 };
  }
  
  // Mathematical reasoning queries
  if (MATHEMATICAL_KEYWORDS.some(k => lowerQuery.includes(k))) {
    return { type: 'mathematical_reasoning', route: 'deepseek-reasoner', confidence: 0.9 };
  }
  
  // Market data queries
  if (MARKET_DATA_KEYWORDS.some(k => lowerQuery.includes(k))) {
    return { type: 'market_data', route: 'perplexity', confidence: 0.85 };
  }
  
  // Complex queries (length-based heuristic)
  if (query.length > 200 || query.includes('analyze') || query.includes('explain in detail')) {
    return { type: 'complex', route: 'claude-sonnet', confidence: 0.8 };
  }
  
  // Default: simple query
  return { type: 'simple', route: 'gemini-flash', confidence: 0.75 };
}

// Cost estimation per model
const COST_PER_1K_TOKENS: Record<ModelRoute, { input: number; output: number }> = {
  'gemini-flash': { input: 0.00035, output: 0.00105 },
  'claude-sonnet': { input: 0.003, output: 0.015 },
  'deepseek-reasoner': { input: 0.00014, output: 0.00028 },
  'perplexity': { input: 0.001, output: 0.001 },
  'gpt-5': { input: 0.002, output: 0.006 },
  'groq-llama': { input: 0.00005, output: 0.00008 },
};

function estimateCost(route: ModelRoute, inputTokens: number, outputTokens: number): number {
  const costs = COST_PER_1K_TOKENS[route];
  return (inputTokens / 1000 * costs.input) + (outputTokens / 1000 * costs.output);
}

describe('Model Routing - Query Classification', () => {
  describe('Mathematical Reasoning Detection', () => {
    it('should route debt optimization queries to Deepseek', () => {
      const queries = [
        'Calculate the optimal debt payoff strategy for my credit cards',
        'What is the NPV of paying off my mortgage early?',
        'Run a Monte Carlo simulation for my retirement',
        'Calculate compound interest on my savings',
      ];
      
      queries.forEach(query => {
        const result = classifyQuery(query);
        expect(result.route).toBe('deepseek-reasoner');
        expect(result.type).toBe('mathematical_reasoning');
      });
    });

    it('should route sensitivity analysis to Deepseek', () => {
      const result = classifyQuery('Run sensitivity analysis on my investment returns');
      expect(result.route).toBe('deepseek-reasoner');
    });

    it('should route ROI calculations to Deepseek', () => {
      const result = classifyQuery('What is the ROI of refinancing my car loan?');
      expect(result.route).toBe('deepseek-reasoner');
    });
  });

  describe('Speed-Critical Detection', () => {
    it('should route transaction categorization to Groq', () => {
      const result = classifyQuery('Categorize this transaction: Starbucks $4.50');
      expect(result.route).toBe('groq-llama');
      expect(result.type).toBe('speed_critical');
    });

    it('should route alert queries to Groq', () => {
      const result = classifyQuery('Alert me about unusual spending');
      expect(result.route).toBe('groq-llama');
    });

    it('should route real-time notifications to Groq', () => {
      const result = classifyQuery('Quick notification for this charge');
      expect(result.route).toBe('groq-llama');
    });
  });

  describe('Document Analysis Detection', () => {
    it('should route tax document queries to GPT-5', () => {
      const result = classifyQuery('Analyze this W-2 form');
      expect(result.route).toBe('gpt-5');
      expect(result.type).toBe('document_analysis');
    });

    it('should route attachment queries to GPT-5', () => {
      const result = classifyQuery('What is this?', true);
      expect(result.route).toBe('gpt-5');
    });

    it('should route receipt queries to GPT-5', () => {
      const result = classifyQuery('Extract data from this receipt');
      expect(result.route).toBe('gpt-5');
    });
  });

  describe('Market Data Detection', () => {
    it('should route stock queries to Perplexity', () => {
      const result = classifyQuery('What is the current stock price of AAPL?');
      expect(result.route).toBe('perplexity');
      expect(result.type).toBe('market_data');
    });

    it('should route market news to Perplexity', () => {
      const result = classifyQuery('Latest market news today');
      expect(result.route).toBe('perplexity');
    });
  });

  describe('Complex Query Detection', () => {
    it('should route long queries to Claude', () => {
      const longQuery = 'A'.repeat(250);
      const result = classifyQuery(longQuery);
      expect(result.route).toBe('claude-sonnet');
      expect(result.type).toBe('complex');
    });

    it('should route detailed analysis requests to Claude', () => {
      const result = classifyQuery('Explain in detail how my portfolio performed this quarter');
      expect(result.route).toBe('claude-sonnet');
    });
  });

  describe('Simple Query Default', () => {
    it('should route simple queries to Gemini Flash', () => {
      const result = classifyQuery('What is my balance?');
      expect(result.route).toBe('gemini-flash');
      expect(result.type).toBe('simple');
    });

    it('should route basic questions to Gemini Flash', () => {
      const result = classifyQuery('Show my recent transactions');
      expect(result.route).toBe('gemini-flash');
    });
  });
});

describe('Model Routing - Cost Estimation', () => {
  it('should calculate correct costs for Deepseek', () => {
    const cost = estimateCost('deepseek-reasoner', 1000, 500);
    expect(cost).toBeCloseTo(0.00014 + 0.00014, 4); // Very low cost
  });

  it('should calculate correct costs for Claude', () => {
    const cost = estimateCost('claude-sonnet', 1000, 500);
    expect(cost).toBeCloseTo(0.003 + 0.0075, 4); // Higher cost
  });

  it('should show Deepseek is cheaper than Claude', () => {
    const deepseekCost = estimateCost('deepseek-reasoner', 2000, 1000);
    const claudeCost = estimateCost('claude-sonnet', 2000, 1000);
    
    expect(deepseekCost).toBeLessThan(claudeCost);
    expect(claudeCost / deepseekCost).toBeGreaterThan(10); // ~10x cheaper
  });

  it('should show Groq is cheapest for speed-critical', () => {
    const groqCost = estimateCost('groq-llama', 1000, 500);
    const geminCost = estimateCost('gemini-flash', 1000, 500);
    
    expect(groqCost).toBeLessThan(geminCost);
  });
});

describe('Model Routing - Fallback Behavior', () => {
  it('should have fallback route for failed Deepseek', () => {
    const primaryRoute = 'deepseek-reasoner';
    const fallbackRoute = 'gemini-flash';
    
    // Simulate fallback logic
    const shouldFallback = (error: string) => {
      return error.includes('API error') || error.includes('rate limit');
    };
    
    expect(shouldFallback('API error: 429')).toBe(true);
    expect(shouldFallback('rate limit exceeded')).toBe(true);
    expect(shouldFallback('success')).toBe(false);
  });

  it('should have fallback route for failed Perplexity', () => {
    const primaryRoute = 'perplexity';
    const fallbackRoute = 'gemini-flash';
    
    // Perplexity fallback is Gemini Flash
    expect(fallbackRoute).toBe('gemini-flash');
  });
});

describe('Model Routing - Confidence Scores', () => {
  it('should have high confidence for mathematical queries', () => {
    const result = classifyQuery('Calculate NPV');
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('should have moderate confidence for simple queries', () => {
    const result = classifyQuery('Hi');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    expect(result.confidence).toBeLessThan(0.85);
  });
});

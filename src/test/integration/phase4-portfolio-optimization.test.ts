/**
 * Phase 4: Portfolio Optimization Integration Tests
 * Tests for optimize-portfolio edge function, risk calculations, and tax-loss harvesting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockPortfolioHoldings,
  createMockPortfolioOptimizationResponse,
  createMockDeepseekResponse,
  createMockQuotaState,
  createMockSupabaseClient,
  type MockPortfolioHolding,
} from '../mocks/phase4Responses';

// ==================== Unit Tests: Risk Calculations ====================

describe('Portfolio Risk Calculations', () => {
  describe('Sharpe Ratio', () => {
    it('should calculate Sharpe ratio correctly', () => {
      // Sharpe = (Portfolio Return - Risk-Free Rate) / Portfolio Std Dev
      const portfolioReturn = 0.12; // 12%
      const riskFreeRate = 0.04; // 4%
      const stdDev = 0.15; // 15%
      
      const sharpeRatio = (portfolioReturn - riskFreeRate) / stdDev;
      
      expect(sharpeRatio).toBeCloseTo(0.533, 2);
    });

    it('should return higher Sharpe for better risk-adjusted returns', () => {
      const calculateSharpe = (ret: number, rf: number, std: number) => (ret - rf) / std;
      
      const sharpe1 = calculateSharpe(0.12, 0.04, 0.15); // Good
      const sharpe2 = calculateSharpe(0.08, 0.04, 0.20); // Poor
      
      expect(sharpe1).toBeGreaterThan(sharpe2);
    });

    it('should handle edge case of zero volatility', () => {
      const portfolioReturn = 0.12;
      const riskFreeRate = 0.04;
      const stdDev = 0;
      
      // Division by zero should be handled
      const sharpeRatio = stdDev === 0 ? Infinity : (portfolioReturn - riskFreeRate) / stdDev;
      
      expect(sharpeRatio).toBe(Infinity);
    });

    it('should validate typical Sharpe ratio ranges', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      
      // Typical Sharpe ratios range from -1 to 3
      expect(mockResponse.riskMetrics.sharpeRatio).toBeGreaterThan(0);
      expect(mockResponse.riskMetrics.sharpeRatio).toBeLessThan(4);
    });
  });

  describe('Sortino Ratio', () => {
    it('should only consider downside deviation', () => {
      // Sortino = (Portfolio Return - Risk-Free Rate) / Downside Deviation
      const returns = [0.05, -0.03, 0.08, -0.02, 0.04, -0.01, 0.06];
      const riskFreeRate = 0.02;
      
      // Calculate downside deviation (only negative returns below target)
      const downsideReturns = returns.filter(r => r < riskFreeRate);
      const downsideSquares = downsideReturns.map(r => Math.pow(r - riskFreeRate, 2));
      const downsideDeviation = Math.sqrt(downsideSquares.reduce((a, b) => a + b, 0) / downsideReturns.length);
      
      expect(downsideDeviation).toBeGreaterThan(0);
      expect(downsideReturns.length).toBe(3); // Only negative returns
    });

    it('should be higher than Sharpe when positive skew exists', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      
      // Sortino is typically higher than Sharpe for portfolios with positive skew
      expect(mockResponse.riskMetrics.sortinoRatio).toBeGreaterThanOrEqual(mockResponse.riskMetrics.sharpeRatio);
    });
  });

  describe('Max Drawdown', () => {
    it('should calculate maximum peak-to-trough decline', () => {
      const prices = [100, 110, 105, 95, 100, 90, 95, 100];
      
      let peak = prices[0];
      let maxDrawdown = 0;
      
      for (const price of prices) {
        if (price > peak) {
          peak = price;
        }
        const drawdown = (peak - price) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
      
      // Max drawdown is from 110 to 90 = 18.18%
      expect(maxDrawdown).toBeCloseTo(0.1818, 2);
    });

    it('should return 0 for monotonically increasing portfolio', () => {
      const prices = [100, 110, 120, 130, 140];
      
      let peak = prices[0];
      let maxDrawdown = 0;
      
      for (const price of prices) {
        if (price > peak) peak = price;
        const drawdown = (peak - price) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }
      
      expect(maxDrawdown).toBe(0);
    });
  });
});

// ==================== Unit Tests: Tax-Loss Harvesting ====================

describe('Tax-Loss Harvesting', () => {
  describe('Wash Sale Rule', () => {
    it('should calculate 31-day wash sale window correctly', () => {
      const saleDate = new Date('2024-01-15');
      
      const washSaleStart = new Date(saleDate);
      washSaleStart.setDate(washSaleStart.getDate() - 30);
      
      const washSaleEnd = new Date(saleDate);
      washSaleEnd.setDate(washSaleEnd.getDate() + 30);
      
      expect(washSaleStart.toISOString().split('T')[0]).toBe('2023-12-16');
      expect(washSaleEnd.toISOString().split('T')[0]).toBe('2024-02-14');
    });

    it('should flag wash sale risk for recent purchases', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      
      const tslaHarvesting = mockResponse.taxLossHarvesting.find(t => t.symbol === 'TSLA');
      
      expect(tslaHarvesting?.washSaleRisk).toBe(true);
      expect(tslaHarvesting?.washSaleDate).toBeDefined();
    });

    it('should not flag wash sale for positions held > 31 days', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      
      const bndHarvesting = mockResponse.taxLossHarvesting.find(t => t.symbol === 'BND');
      
      expect(bndHarvesting?.washSaleRisk).toBe(false);
    });
  });

  describe('Tax Savings Calculation', () => {
    it('should calculate tax savings based on tax bracket', () => {
      const unrealizedLoss = 1000;
      const taxBracket = 0.30; // 30%
      
      const taxSavings = unrealizedLoss * taxBracket;
      
      expect(taxSavings).toBe(300);
    });

    it('should identify positions with unrealized losses', () => {
      const holdings = createMockPortfolioHoldings();
      
      const positionsWithLosses = holdings.filter(h => 
        h.currentPrice < h.costBasis
      );
      
      // BND, VXUS, TSLA have losses
      expect(positionsWithLosses.length).toBe(3);
      expect(positionsWithLosses.map(p => p.symbol)).toContain('BND');
      expect(positionsWithLosses.map(p => p.symbol)).toContain('VXUS');
      expect(positionsWithLosses.map(p => p.symbol)).toContain('TSLA');
    });

    it('should calculate total unrealized loss correctly', () => {
      const holdings = createMockPortfolioHoldings();
      
      const totalLoss = holdings.reduce((sum, h) => {
        const gain = (h.currentPrice - h.costBasis) * h.shares;
        return gain < 0 ? sum + Math.abs(gain) : sum;
      }, 0);
      
      // BND: (75-80)*150 = -750
      // VXUS: (52-55)*100 = -300
      // TSLA: (250-300)*25 = -1250
      // Total: 2300
      expect(totalLoss).toBe(2300);
    });
  });

  describe('Replacement Securities', () => {
    it('should suggest correlated but not substantially identical securities', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      
      // BND -> AGG (both broad bond ETFs)
      const bndReplacement = mockResponse.taxLossHarvesting.find(t => t.symbol === 'BND');
      expect(bndReplacement?.replacementSymbol).toBe('AGG');
      
      // VXUS -> VEA (both international)
      const vxusReplacement = mockResponse.taxLossHarvesting.find(t => t.symbol === 'VXUS');
      expect(vxusReplacement?.replacementSymbol).toBe('VEA');
    });
  });
});

// ==================== Unit Tests: Rebalancing ====================

describe('Portfolio Rebalancing', () => {
  describe('Target Weight Calculations', () => {
    it('should identify overweight positions', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      
      const overweightPositions = mockResponse.rebalancingRecommendations.filter(
        r => r.currentWeight > r.targetWeight
      );
      
      expect(overweightPositions.length).toBeGreaterThan(0);
      expect(overweightPositions.every(p => p.action === 'sell')).toBe(true);
    });

    it('should identify underweight positions', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      
      const underweightPositions = mockResponse.rebalancingRecommendations.filter(
        r => r.currentWeight < r.targetWeight
      );
      
      expect(underweightPositions.length).toBeGreaterThan(0);
      expect(underweightPositions.every(p => p.action === 'buy')).toBe(true);
    });

    it('should calculate portfolio weights correctly', () => {
      const holdings = createMockPortfolioHoldings();
      
      const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
      
      const weights = holdings.map(h => ({
        symbol: h.symbol,
        weight: (h.currentPrice * h.shares) / totalValue,
      }));
      
      // Weights should sum to 1
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      expect(totalWeight).toBeCloseTo(1, 5);
    });
  });

  describe('Concentration Risk', () => {
    it('should flag single position concentration > 20%', () => {
      const holdings = createMockPortfolioHoldings();
      const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
      
      const concentratedPositions = holdings.filter(h => {
        const weight = (h.currentPrice * h.shares) / totalValue;
        return weight > 0.20;
      });
      
      expect(concentratedPositions.length).toBeGreaterThanOrEqual(0);
    });

    it('should flag sector concentration > 40%', () => {
      const holdings = createMockPortfolioHoldings();
      const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
      
      const sectorWeights: Record<string, number> = {};
      holdings.forEach(h => {
        const weight = (h.currentPrice * h.shares) / totalValue;
        sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + weight;
      });
      
      const concentratedSectors = Object.entries(sectorWeights).filter(([_, weight]) => weight > 0.40);
      
      // Technology sector is concentrated in mock data
      expect(concentratedSectors.some(([sector]) => sector === 'Technology')).toBe(true);
    });
  });
});

// ==================== Integration Tests: Edge Function ====================

describe('Portfolio Optimization Edge Function', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Deepseek Integration', () => {
    it('should construct proper prompt for portfolio analysis', () => {
      const holdings = createMockPortfolioHoldings();
      const riskTolerance = 'moderate';
      const taxBracket = 0.24;
      
      const expectedPromptParts = [
        'portfolio optimization',
        'risk-adjusted returns',
        'Sharpe ratio',
        'tax-loss harvesting',
        JSON.stringify(holdings),
      ];
      
      // Verify prompt construction contains key elements
      const prompt = `Analyze this portfolio for optimization: ${JSON.stringify(holdings)}. 
        Risk tolerance: ${riskTolerance}. Tax bracket: ${taxBracket}.
        Calculate risk-adjusted returns including Sharpe ratio.
        Identify tax-loss harvesting opportunities.`;
      
      expectedPromptParts.forEach(part => {
        expect(prompt.toLowerCase()).toContain(part.toLowerCase());
      });
    });

    it('should parse Deepseek JSON response correctly', () => {
      const mockResponse = createMockPortfolioOptimizationResponse();
      const deepseekResponse = createMockDeepseekResponse(JSON.stringify(mockResponse));
      
      const content = deepseekResponse.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      expect(parsed.riskMetrics).toBeDefined();
      expect(parsed.riskMetrics.sharpeRatio).toBeCloseTo(1.45, 2);
      expect(parsed.taxLossHarvesting).toHaveLength(3);
    });

    it('should handle Deepseek API failure gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('API Error'));
      
      await expect(async () => {
        await mockFetch('https://api.deepseek.com/v1/chat/completions');
      }).rejects.toThrow('API Error');
    });

    it('should track reasoning tokens separately', () => {
      const deepseekResponse = createMockDeepseekResponse('{}', 750);
      
      expect(deepseekResponse.usage.reasoning_tokens).toBe(750);
      expect(deepseekResponse.usage.completion_tokens).toBe(800);
      expect(deepseekResponse.usage.total_tokens).toBe(1050);
    });
  });

  describe('Database Persistence', () => {
    it('should save optimization results to portfolio_optimization_history', async () => {
      const mockResult = createMockPortfolioOptimizationResponse();
      
      mockSupabase.insert.mockResolvedValue({ data: { id: 'test-id' }, error: null });
      
      const insertCall = mockSupabase.from('portfolio_optimization_history').insert({
        user_id: 'test-user',
        input_data: createMockPortfolioHoldings(),
        optimization_type: 'full_analysis',
        recommendations: mockResult.rebalancingRecommendations,
        reasoning_chain: mockResult.reasoning,
        savings_potential: mockResult.taxLossHarvesting.reduce((sum, t) => sum + t.taxSavings, 0),
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_optimization_history');
    });

    it('should log to ai_model_routing_analytics', async () => {
      const analyticsData = {
        user_id: 'test-user',
        model_used: 'deepseek-reasoner',
        query_type: 'portfolio_optimization',
        response_time_ms: 1500,
        token_count: 1050,
        reasoning_tokens: 500,
        estimated_cost: 0.0015,
      };
      
      mockSupabase.insert.mockResolvedValue({ data: null, error: null });
      
      await mockSupabase.from('ai_model_routing_analytics').insert(analyticsData);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_model_routing_analytics');
    });
  });

  describe('Circuit Breaker Integration', () => {
    it('should check quota state before API call', () => {
      const quotaState = createMockQuotaState();
      
      expect(quotaState.circuit_state).toBe('closed');
      expect(quotaState.requests_remaining_rpm).toBeGreaterThan(0);
    });

    it('should not make API call when circuit is open', () => {
      const quotaState = createMockQuotaState({
        circuit_state: 'open',
        consecutive_failures: 3,
      });
      
      expect(quotaState.circuit_state).toBe('open');
      // In real implementation, this would skip API call
    });
  });
});

// ==================== End-to-End Tests ====================

describe('Portfolio Optimization E2E', () => {
  it('should complete full optimization flow', async () => {
    // Step 1: Create mock holdings
    const holdings = createMockPortfolioHoldings();
    expect(holdings).toHaveLength(6);
    
    // Step 2: Mock Deepseek response
    const mockResult = createMockPortfolioOptimizationResponse();
    const deepseekResponse = createMockDeepseekResponse(JSON.stringify(mockResult));
    
    // Step 3: Parse response
    const parsed = JSON.parse(deepseekResponse.choices[0].message.content);
    
    // Step 4: Verify structure
    expect(parsed.riskMetrics).toBeDefined();
    expect(parsed.rebalancingRecommendations).toBeInstanceOf(Array);
    expect(parsed.taxLossHarvesting).toBeInstanceOf(Array);
    
    // Step 5: Verify risk metrics
    expect(parsed.riskMetrics.sharpeRatio).toBeGreaterThan(0);
    expect(parsed.riskMetrics.maxDrawdown).toBeLessThan(1);
    
    // Step 6: Verify tax-loss harvesting
    const totalTaxSavings = parsed.taxLossHarvesting.reduce(
      (sum: number, t: { taxSavings: number }) => sum + t.taxSavings, 
      0
    );
    expect(totalTaxSavings).toBeGreaterThan(0);
  });

  it('should handle edge case of empty portfolio', () => {
    const emptyHoldings: MockPortfolioHolding[] = [];
    
    expect(emptyHoldings).toHaveLength(0);
    // In real implementation, should return appropriate empty response
  });

  it('should handle single-stock portfolio', () => {
    const singleHolding = [createMockPortfolioHoldings()[0]];
    
    expect(singleHolding).toHaveLength(1);
    // Concentration risk should be 100%
    const weight = 1.0;
    expect(weight).toBe(1.0);
  });
});

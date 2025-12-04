import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  calculateSavings, 
  calculateEfficiency, 
  categorizeQueryType 
} from '@/hooks/useUserAIUsageSummary';
import {
  createMockAIAnalyticsRecord,
  createMockBudgetAnalytics,
  createMockInvestmentAnalytics,
  createMockRetirementAnalytics,
  createMockFallbackAnalytics,
} from '@/test/mocks/aiUsageMocks';

describe('useUserAIUsageSummary', () => {
  describe('calculateSavings', () => {
    const CLAUDE_BASELINE = 0.50;

    it('calculates correct savings with standard cost', () => {
      const totalQueries = 10;
      const actualCost = 0.20; // $0.02 per query
      const expectedSavings = (totalQueries * CLAUDE_BASELINE) - actualCost;
      
      expect(calculateSavings(totalQueries, actualCost)).toBe(expectedSavings);
    });

    it('returns 0 savings when actual cost equals baseline', () => {
      const totalQueries = 10;
      const actualCost = totalQueries * CLAUDE_BASELINE;
      
      expect(calculateSavings(totalQueries, actualCost)).toBe(0);
    });

    it('returns 0 savings when actual cost exceeds baseline', () => {
      const totalQueries = 10;
      const actualCost = 10; // More expensive than Claude
      
      expect(calculateSavings(totalQueries, actualCost)).toBe(0);
    });

    it('returns 0 savings for zero queries', () => {
      expect(calculateSavings(0, 0)).toBe(0);
    });

    it('handles large query counts', () => {
      const totalQueries = 1000;
      const actualCost = 20; // $0.02 per query
      const expectedSavings = (totalQueries * CLAUDE_BASELINE) - actualCost;
      
      expect(calculateSavings(totalQueries, actualCost)).toBe(expectedSavings);
      expect(calculateSavings(totalQueries, actualCost)).toBe(480);
    });
  });

  describe('calculateEfficiency', () => {
    it('returns 100% when no items', () => {
      expect(calculateEfficiency([])).toBe(100);
    });

    it('returns 100% when all queries successful', () => {
      const items = [
        { was_fallback: false },
        { was_fallback: false },
        { was_fallback: false },
      ];
      expect(calculateEfficiency(items)).toBe(100);
    });

    it('returns correct percentage with mixed fallbacks', () => {
      const items = [
        { was_fallback: false },
        { was_fallback: false },
        { was_fallback: true },
        { was_fallback: false },
      ];
      expect(calculateEfficiency(items)).toBe(75);
    });

    it('returns 0% when all queries fallback', () => {
      const items = [
        { was_fallback: true },
        { was_fallback: true },
      ];
      expect(calculateEfficiency(items)).toBe(0);
    });

    it('handles null was_fallback as successful', () => {
      const items = [
        { was_fallback: null },
        { was_fallback: undefined },
        { was_fallback: false },
      ];
      expect(calculateEfficiency(items)).toBe(100);
    });

    it('rounds to nearest integer', () => {
      const items = [
        { was_fallback: false },
        { was_fallback: false },
        { was_fallback: true },
      ];
      // 66.666...% should round to 67%
      expect(calculateEfficiency(items)).toBe(67);
    });
  });

  describe('categorizeQueryType', () => {
    it('categorizes budget keywords correctly', () => {
      expect(categorizeQueryType('budget_optimization')).toBe('Budget Optimizations');
      expect(categorizeQueryType('monthly_budget')).toBe('Budget Optimizations');
      expect(categorizeQueryType('spending_optimization')).toBe('Budget Optimizations');
    });

    it('categorizes investment keywords correctly', () => {
      expect(categorizeQueryType('portfolio_analysis')).toBe('Investment Analyses');
      expect(categorizeQueryType('investment_recommendation')).toBe('Investment Analyses');
      expect(categorizeQueryType('portfolio_rebalancing')).toBe('Investment Analyses');
    });

    it('categorizes retirement keywords correctly', () => {
      expect(categorizeQueryType('retirement_planning')).toBe('Retirement Projections');
      expect(categorizeQueryType('retirement_savings')).toBe('Retirement Projections');
    });

    it('defaults to Financial Insights for unknown types', () => {
      expect(categorizeQueryType('general')).toBe('Financial Insights');
      expect(categorizeQueryType('chat')).toBe('Financial Insights');
      expect(categorizeQueryType('')).toBe('Financial Insights');
      expect(categorizeQueryType('unknown')).toBe('Financial Insights');
    });

    it('handles case insensitivity', () => {
      expect(categorizeQueryType('BUDGET_OPTIMIZATION')).toBe('Budget Optimizations');
      expect(categorizeQueryType('Portfolio_Analysis')).toBe('Investment Analyses');
      expect(categorizeQueryType('RETIREMENT_planning')).toBe('Retirement Projections');
    });
  });

  describe('Mock Analytics Records', () => {
    it('creates valid budget analytics record', () => {
      const record = createMockBudgetAnalytics();
      expect(record.query_type).toBe('budget_optimization');
      expect(categorizeQueryType(record.query_type)).toBe('Budget Optimizations');
    });

    it('creates valid investment analytics record', () => {
      const record = createMockInvestmentAnalytics();
      expect(record.query_type).toBe('portfolio_analysis');
      expect(categorizeQueryType(record.query_type)).toBe('Investment Analyses');
    });

    it('creates valid retirement analytics record', () => {
      const record = createMockRetirementAnalytics();
      expect(record.query_type).toBe('retirement_planning');
      expect(categorizeQueryType(record.query_type)).toBe('Retirement Projections');
    });

    it('creates valid fallback analytics record', () => {
      const record = createMockFallbackAnalytics();
      expect(record.was_fallback).toBe(true);
    });

    it('creates record with custom overrides', () => {
      const record = createMockAIAnalyticsRecord({
        query_type: 'custom_type',
        estimated_cost: 0.10,
      });
      expect(record.query_type).toBe('custom_type');
      expect(record.estimated_cost).toBe(0.10);
    });
  });

  describe('Integration: Savings Calculation with Mock Data', () => {
    it('calculates realistic savings from mock records', () => {
      const records = [
        createMockBudgetAnalytics(),
        createMockInvestmentAnalytics(),
        createMockRetirementAnalytics(),
      ];
      
      const totalQueries = records.length;
      const actualCost = records.reduce((sum, r) => sum + (r.estimated_cost || 0.02), 0);
      const savings = calculateSavings(totalQueries, actualCost);
      
      // 3 queries * $0.50 baseline = $1.50
      // Actual cost ~$0.045 (0.01 + 0.015 + 0.02)
      // Savings should be ~$1.455
      expect(savings).toBeGreaterThan(1.4);
      expect(savings).toBeLessThan(1.5);
    });

    it('efficiency calculation with mixed success/fallback', () => {
      const items = [
        createMockBudgetAnalytics(),
        createMockInvestmentAnalytics(),
        createMockFallbackAnalytics(),
        createMockRetirementAnalytics(),
      ];
      
      // 3 successful, 1 fallback = 75%
      expect(calculateEfficiency(items)).toBe(75);
    });
  });
});

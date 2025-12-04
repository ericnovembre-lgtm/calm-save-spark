import { describe, it, expect, vi } from 'vitest';
import {
  createMockTransaction,
  createMockGroqResponse,
} from './mocks/transactionAlerts';

/**
 * Anomaly detection logic tests
 *
 * These tests verify the client-side classification logic that would mirror
 * what Groq does server-side. This helps ensure consistent anomaly detection
 * across the application.
 */

// Local anomaly detection logic (mirrors edge function logic)
interface Transaction {
  merchant: string;
  amount: number;
  category: string;
  transaction_date: string;
}

interface SpendingHistory {
  averageSpend: number;
  categories: Record<string, number>;
  recentTransactions: Transaction[];
}

interface AnomalyResult {
  isAnomaly: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  alertType: string | null;
  confidence: number;
  reason: string | null;
}

function detectAnomaly(
  transaction: Transaction,
  history: SpendingHistory
): AnomalyResult {
  const amount = Math.abs(transaction.amount);
  const avgSpend = history.averageSpend || 100;

  // Check for unusual amount (> 3x average)
  if (amount > avgSpend * 3) {
    return {
      isAnomaly: true,
      riskLevel: amount > avgSpend * 5 ? 'high' : 'medium',
      alertType: 'unusual_amount',
      confidence: Math.min(0.95, 0.7 + (amount / avgSpend) * 0.05),
      reason: `Transaction amount $${amount.toFixed(2)} is ${(amount / avgSpend).toFixed(1)}x your average spend`,
    };
  }

  // Check for duplicate charges (same merchant + amount within 24h)
  const duplicates = history.recentTransactions.filter((t) => {
    const timeDiff =
      new Date(transaction.transaction_date).getTime() -
      new Date(t.transaction_date).getTime();
    const within24h = Math.abs(timeDiff) < 24 * 60 * 60 * 1000;
    return (
      t.merchant === transaction.merchant &&
      Math.abs(t.amount) === Math.abs(transaction.amount) &&
      within24h
    );
  });

  if (duplicates.length > 0) {
    return {
      isAnomaly: true,
      riskLevel: 'medium',
      alertType: 'duplicate_charge',
      confidence: 0.9,
      reason: `Potential duplicate charge at ${transaction.merchant}`,
    };
  }

  // Check for suspicious merchant patterns
  const suspiciousMerchants = [
    'unknown',
    'suspicious',
    'test',
    'foreign',
    'crypto',
  ];
  const merchantLower = transaction.merchant.toLowerCase();
  const isSuspiciousMerchant = suspiciousMerchants.some((pattern) =>
    merchantLower.includes(pattern)
  );

  if (isSuspiciousMerchant) {
    return {
      isAnomaly: true,
      riskLevel: 'high',
      alertType: 'suspicious_merchant',
      confidence: 0.85,
      reason: `Transaction at potentially suspicious merchant: ${transaction.merchant}`,
    };
  }

  // Check for unusual category spending
  const categoryAvg = history.categories[transaction.category] || avgSpend;
  if (amount > categoryAvg * 2.5) {
    return {
      isAnomaly: true,
      riskLevel: 'low',
      alertType: 'category_overspend',
      confidence: 0.7,
      reason: `${transaction.category} spending unusually high`,
    };
  }

  // No anomaly detected
  return {
    isAnomaly: false,
    riskLevel: 'low',
    alertType: null,
    confidence: 0.1,
    reason: null,
  };
}

describe('Anomaly Detection Logic', () => {
  const defaultHistory: SpendingHistory = {
    averageSpend: 50,
    categories: {
      Shopping: 40,
      Dining: 30,
      Entertainment: 25,
    },
    recentTransactions: [],
  };

  describe('Unusual Amount Detection', () => {
    it('should detect unusual amounts (> 3x average spend)', () => {
      const transaction = createMockTransaction({
        amount: -200, // 4x the $50 average
        merchant: 'Regular Store',
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.isAnomaly).toBe(true);
      expect(result.alertType).toBe('unusual_amount');
      expect(result.riskLevel).toBe('medium');
    });

    it('should assign high risk for very large amounts (> 5x average)', () => {
      const transaction = createMockTransaction({
        amount: -300, // 6x the $50 average
        merchant: 'Expensive Store',
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.isAnomaly).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    it('should not flag normal transactions under threshold', () => {
      const transaction = createMockTransaction({
        amount: -100, // 2x average, under 3x threshold
        merchant: 'Normal Store',
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.isAnomaly).toBe(false);
    });

    it('should have higher confidence for larger anomalies', () => {
      const smallAnomaly = createMockTransaction({ amount: -160 });
      const largeAnomaly = createMockTransaction({ amount: -400 });

      const smallResult = detectAnomaly(smallAnomaly as Transaction, defaultHistory);
      const largeResult = detectAnomaly(largeAnomaly as Transaction, defaultHistory);

      expect(largeResult.confidence).toBeGreaterThan(smallResult.confidence);
    });
  });

  describe('Duplicate Charge Detection', () => {
    it('should detect duplicate charges (same merchant + amount within 24h)', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const historyWithRecent: SpendingHistory = {
        ...defaultHistory,
        recentTransactions: [
          {
            merchant: 'Coffee Shop',
            amount: -5.99,
            category: 'Dining',
            transaction_date: twoHoursAgo.toISOString(),
          },
        ],
      };

      const transaction = createMockTransaction({
        merchant: 'Coffee Shop',
        amount: -5.99,
        transaction_date: now.toISOString(),
      });

      const result = detectAnomaly(transaction as Transaction, historyWithRecent);

      expect(result.isAnomaly).toBe(true);
      expect(result.alertType).toBe('duplicate_charge');
      expect(result.riskLevel).toBe('medium');
    });

    it('should not flag transactions more than 24h apart', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const historyWithOld: SpendingHistory = {
        ...defaultHistory,
        recentTransactions: [
          {
            merchant: 'Coffee Shop',
            amount: -5.99,
            category: 'Dining',
            transaction_date: twoDaysAgo.toISOString(),
          },
        ],
      };

      const transaction = createMockTransaction({
        merchant: 'Coffee Shop',
        amount: -5.99,
        transaction_date: now.toISOString(),
      });

      const result = detectAnomaly(transaction as Transaction, historyWithOld);

      expect(result.alertType).not.toBe('duplicate_charge');
    });
  });

  describe('Suspicious Merchant Detection', () => {
    it('should detect suspicious merchants (unknown patterns)', () => {
      const transaction = createMockTransaction({
        merchant: 'UNKNOWN FOREIGN MERCHANT',
        amount: -25,
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.isAnomaly).toBe(true);
      expect(result.alertType).toBe('suspicious_merchant');
      expect(result.riskLevel).toBe('high');
    });

    it('should flag crypto-related merchants', () => {
      const transaction = createMockTransaction({
        merchant: 'CryptoExchange XYZ',
        amount: -100,
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.isAnomaly).toBe(true);
      expect(result.alertType).toBe('suspicious_merchant');
    });

    it('should not flag legitimate merchants', () => {
      const transaction = createMockTransaction({
        merchant: 'Amazon',
        amount: -25,
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.alertType).not.toBe('suspicious_merchant');
    });
  });

  describe('Category Overspend Detection', () => {
    it('should detect category overspending (> 2.5x category average)', () => {
      const transaction = createMockTransaction({
        merchant: 'Restaurant',
        amount: -100, // 3.3x the $30 dining average
        category: 'Dining',
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.isAnomaly).toBe(true);
      expect(result.alertType).toBe('category_overspend');
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Risk Level Assignment', () => {
    it('should assign correct risk levels based on anomaly type', () => {
      // High risk: suspicious merchant
      const suspiciousResult = detectAnomaly(
        createMockTransaction({ merchant: 'SUSPICIOUS SHOP' }) as Transaction,
        defaultHistory
      );
      expect(suspiciousResult.riskLevel).toBe('high');

      // Medium risk: duplicate charge
      const duplicateHistory: SpendingHistory = {
        ...defaultHistory,
        recentTransactions: [
          {
            merchant: 'Store',
            amount: -10,
            category: 'Shopping',
            transaction_date: new Date().toISOString(),
          },
        ],
      };
      const duplicateResult = detectAnomaly(
        createMockTransaction({
          merchant: 'Store',
          amount: -10,
          transaction_date: new Date().toISOString(),
        }) as Transaction,
        duplicateHistory
      );
      expect(duplicateResult.riskLevel).toBe('medium');
    });
  });

  describe('Normal Transaction Handling', () => {
    it('should return isAnomaly: false for normal transactions', () => {
      const transaction = createMockTransaction({
        merchant: 'Grocery Store',
        amount: -45,
        category: 'Shopping',
      });

      const result = detectAnomaly(transaction as Transaction, defaultHistory);

      expect(result.isAnomaly).toBe(false);
      expect(result.alertType).toBeNull();
      expect(result.reason).toBeNull();
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Mock Helpers', () => {
    it('createMockGroqResponse should create valid anomaly response', () => {
      const response = createMockGroqResponse(true, 'high');

      expect(response.isAnomaly).toBe(true);
      expect(response.riskLevel).toBe('high');
      expect(response.alertType).toBeDefined();
      expect(response.title).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.latencyMs).toBeGreaterThan(0);
    });

    it('createMockGroqResponse should create valid non-anomaly response', () => {
      const response = createMockGroqResponse(false);

      expect(response.isAnomaly).toBe(false);
      expect(response.alertType).toBeNull();
      expect(response.title).toBeNull();
      expect(response.message).toBeNull();
    });
  });
});

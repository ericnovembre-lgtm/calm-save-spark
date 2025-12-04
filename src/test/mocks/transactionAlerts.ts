import type { TransactionAlert } from '@/hooks/useTransactionAlerts';

/**
 * Creates a mock TransactionAlert with customizable properties
 */
export function createMockTransactionAlert(
  overrides: Partial<TransactionAlert> = {}
): TransactionAlert {
  const defaultMetadata = {
    transaction_id: `txn-${Math.random().toString(36).slice(2, 9)}`,
    merchant: 'Test Merchant',
    amount: -149.99,
    category: 'Shopping',
    alert_type: 'unusual_amount',
    risk_level: 'medium',
    latency_ms: 87,
    model: 'llama-3.3-70b-versatile',
  };

  return {
    id: `alert-${Math.random().toString(36).slice(2, 9)}`,
    user_id: 'test-user-id',
    notification_type: 'transaction_alert',
    title: 'Suspicious Transaction Detected',
    message: 'Unusual spending pattern detected at this merchant.',
    priority: 'high',
    read: false,
    created_at: new Date().toISOString(),
    ...overrides,
    metadata: {
      ...defaultMetadata,
      ...overrides.metadata,
    },
  };
}

/**
 * Creates a mock transaction for testing
 */
export function createMockTransaction(overrides: Record<string, any> = {}) {
  return {
    id: `txn-${Math.random().toString(36).slice(2, 9)}`,
    user_id: 'test-user-id',
    merchant: 'Test Merchant',
    amount: -49.99,
    category: 'Shopping',
    transaction_date: new Date().toISOString(),
    account_id: 'test-account-id',
    pending: false,
    ...overrides,
  };
}

/**
 * Creates a mock Groq anomaly detection response
 */
export function createMockGroqResponse(
  isAnomaly: boolean = true,
  riskLevel: 'low' | 'medium' | 'high' = 'medium'
) {
  return {
    isAnomaly,
    riskLevel,
    alertType: isAnomaly ? 'unusual_amount' : null,
    title: isAnomaly ? 'Suspicious Transaction Detected' : null,
    message: isAnomaly
      ? 'This transaction appears unusual based on your spending patterns.'
      : null,
    confidence: isAnomaly ? 0.85 : 0.1,
    latencyMs: Math.floor(Math.random() * 100) + 50,
  };
}

/**
 * Creates a mock queue entry
 */
export function createMockQueueEntry(overrides: Record<string, any> = {}) {
  return {
    id: `queue-${Math.random().toString(36).slice(2, 9)}`,
    transaction_id: `txn-${Math.random().toString(36).slice(2, 9)}`,
    user_id: 'test-user-id',
    status: 'pending',
    created_at: new Date().toISOString(),
    processed_at: null,
    error_message: null,
    ...overrides,
  };
}

/**
 * Creates multiple mock alerts for batch testing
 */
export function createMockAlertBatch(
  count: number,
  riskDistribution: { high: number; medium: number; low: number } = {
    high: 1,
    medium: 2,
    low: 1,
  }
): TransactionAlert[] {
  const alerts: TransactionAlert[] = [];
  const total = riskDistribution.high + riskDistribution.medium + riskDistribution.low;

  for (let i = 0; i < count; i++) {
    const index = i % total;
    let riskLevel: 'high' | 'medium' | 'low';

    if (index < riskDistribution.high) {
      riskLevel = 'high';
    } else if (index < riskDistribution.high + riskDistribution.medium) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    alerts.push(
      createMockTransactionAlert({
        metadata: { risk_level: riskLevel },
      })
    );
  }

  return alerts;
}

/**
 * Mock Supabase realtime event helper
 */
export const mockSupabaseRealtime = {
  channels: new Map<string, { callbacks: Array<(payload: any) => void> }>(),

  createChannel(name: string) {
    this.channels.set(name, { callbacks: [] });
    return {
      on: (_event: string, _filter: any, callback: (payload: any) => void) => {
        this.channels.get(name)?.callbacks.push(callback);
        return this;
      },
      subscribe: () => this,
    };
  },

  emit(channelName: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', data: any) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.callbacks.forEach((cb) =>
        cb({
          eventType,
          new: data,
          old: null,
        })
      );
    }
  },

  clear() {
    this.channels.clear();
  },
};

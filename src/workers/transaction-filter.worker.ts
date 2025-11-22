/**
 * Transaction Filter Web Worker
 * Phase 6: Performance Optimizations
 * 
 * Offloads heavy filtering operations to background thread
 */

interface WorkerMessage {
  type: 'FILTER_TRANSACTIONS';
  data: {
    transactions: any[];
    filters: any;
  };
  id: string;
}

interface WorkerResponse {
  type: 'RESULT' | 'ERROR';
  result?: any;
  error?: string;
  id: string;
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data, id } = event.data;

  try {
    if (type === 'FILTER_TRANSACTIONS') {
      const { transactions, filters } = data;
      
      let filtered = transactions;

      // Apply filters
      if (filters.category) {
        filtered = filtered.filter((t: any) => t.category === filters.category);
      }

      if (filters.merchant) {
        const merchantLower = filters.merchant.toLowerCase();
        filtered = filtered.filter((t: any) => 
          t.merchant?.toLowerCase().includes(merchantLower)
        );
      }

      if (filters.amountMin !== undefined) {
        filtered = filtered.filter((t: any) => t.amount >= filters.amountMin);
      }

      if (filters.amountMax !== undefined) {
        filtered = filtered.filter((t: any) => t.amount <= filters.amountMax);
      }

      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        filtered = filtered.filter((t: any) => {
          const date = new Date(t.transaction_date);
          return date >= start && date <= end;
        });
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter((t: any) =>
          t.merchant?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
        );
      }

      const response: WorkerResponse = {
        type: 'RESULT',
        result: filtered,
        id,
      };

      self.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      id,
    };

    self.postMessage(response);
  }
});

export {};

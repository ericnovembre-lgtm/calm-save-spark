import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Algolia configuration from environment variables
const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY || '';

// Check if Algolia is configured
export const isAlgoliaConfigured = (): boolean => {
  return Boolean(ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY);
};

// Create Algolia search client (only if configured)
export const searchClient = isAlgoliaConfigured() 
  ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)
  : null;

// Index names
export const ALGOLIA_INDICES = {
  TRANSACTIONS: 'transactions',
  GOALS: 'goals',
  BUDGETS: 'budgets',
  DEBTS: 'debts',
} as const;

export type AlgoliaIndex = typeof ALGOLIA_INDICES[keyof typeof ALGOLIA_INDICES];

// Type definitions for search results
export interface TransactionHit {
  objectID: string;
  merchant: string;
  description: string | null;
  amount: number;
  category: string | null;
  transaction_date: string;
  account_id: string | null;
  user_id: string;
}

export interface GoalHit {
  objectID: string;
  goal_name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  is_active: boolean;
  user_id: string;
}

export interface BudgetHit {
  objectID: string;
  name: string;
  period: string;
  total_limit: number;
  is_active: boolean;
  currency: string | null;
  user_id: string;
}

export interface DebtHit {
  objectID: string;
  debt_name: string;
  debt_type: string | null;
  current_balance: number;
  interest_rate: number | null;
  minimum_payment: number | null;
  status: string | null;
  is_active: boolean;
  creditor: string | null;
  user_id: string;
}

// Union type for all hits
export type SearchHit = TransactionHit | GoalHit | BudgetHit | DebtHit;

// Search helper with user filtering
export async function searchWithUserFilter<T extends SearchHit>(
  indexName: AlgoliaIndex,
  query: string,
  userId: string,
  options?: {
    hitsPerPage?: number;
    page?: number;
    filters?: string;
  }
): Promise<{ hits: T[]; nbHits: number; page: number; nbPages: number } | null> {
  if (!searchClient) {
    console.warn('Algolia is not configured');
    return null;
  }

  try {
    const userFilter = `user_id:${userId}`;
    const combinedFilters = options?.filters 
      ? `${userFilter} AND ${options.filters}`
      : userFilter;

    const results = await searchClient.search<T>({
      requests: [{
        indexName,
        query,
        filters: combinedFilters,
        hitsPerPage: options?.hitsPerPage ?? 20,
        page: options?.page ?? 0,
      }],
    });

    const firstResult = results.results[0];
    if ('hits' in firstResult) {
      return {
        hits: firstResult.hits,
        nbHits: firstResult.nbHits ?? 0,
        page: firstResult.page ?? 0,
        nbPages: firstResult.nbPages ?? 0,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Algolia search error:', error);
    return null;
  }
}

// Multi-index search for universal search
export async function multiIndexSearch(
  query: string,
  userId: string,
  indices: AlgoliaIndex[] = [ALGOLIA_INDICES.TRANSACTIONS, ALGOLIA_INDICES.GOALS]
): Promise<Map<AlgoliaIndex, SearchHit[]> | null> {
  if (!searchClient) {
    console.warn('Algolia is not configured');
    return null;
  }

  try {
    const userFilter = `user_id:${userId}`;

    const results = await searchClient.search({
      requests: indices.map(indexName => ({
        indexName,
        query,
        filters: userFilter,
        hitsPerPage: 10,
      })),
    });

    const resultMap = new Map<AlgoliaIndex, SearchHit[]>();
    
    results.results.forEach((result, index) => {
      if ('hits' in result) {
        resultMap.set(indices[index], result.hits as SearchHit[]);
      }
    });

    return resultMap;
  } catch (error) {
    console.error('Algolia multi-index search error:', error);
    return null;
  }
}

/**
 * Extended Query Key Factory for Transaction Filtering & Caching
 */

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...transactionKeys.lists(), filters] as const,
  byMonth: (year: number, month: number) => [...transactionKeys.all, 'month', year, month] as const,
  search: (query: string) => [...transactionKeys.all, 'search', query] as const,
  infinite: (filters?: Record<string, any>) => [...transactionKeys.lists(), 'infinite', filters] as const,
} as const;

export const merchantKeys = {
  all: ['merchants'] as const,
  enrichment: (rawName: string) => [...merchantKeys.all, 'enrichment', rawName] as const,
  logo: (merchantName: string) => [...merchantKeys.all, 'logo', merchantName] as const,
} as const;

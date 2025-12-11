/**
 * Algolia-powered instant search for transactions
 * Falls back to OptimizedSearchBar if Algolia is not configured
 */
import { useState, useCallback, useEffect } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  searchWithUserFilter, 
  isAlgoliaConfigured, 
  ALGOLIA_INDICES,
  TransactionHit 
} from '@/lib/algolia-client';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';

interface AlgoliaTransactionSearchProps {
  onSelectTransaction?: (transaction: TransactionHit) => void;
  onSearchResults?: (results: TransactionHit[], query: string) => void;
  placeholder?: string;
}

export function AlgoliaTransactionSearch({
  onSelectTransaction,
  onSearchResults,
  placeholder = "Instant search transactions..."
}: AlgoliaTransactionSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TransactionHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalHits, setTotalHits] = useState(0);
  
  const debouncedQuery = useDebounce(query, 300);

  // Get user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || !userId || !isAlgoliaConfigured()) {
      setResults([]);
      setTotalHits(0);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const searchResults = await searchWithUserFilter<TransactionHit>(
          ALGOLIA_INDICES.TRANSACTIONS,
          debouncedQuery,
          userId,
          { hitsPerPage: 10 }
        );

        if (searchResults) {
          setResults(searchResults.hits);
          setTotalHits(searchResults.nbHits);
          onSearchResults?.(searchResults.hits, debouncedQuery);
        }
      } catch (error) {
        console.error('Algolia search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, userId, onSearchResults]);

  const handleSelect = useCallback((hit: TransactionHit) => {
    onSelectTransaction?.(hit);
    setQuery('');
    setResults([]);
  }, [onSelectTransaction]);

  if (!isAlgoliaConfigured()) {
    return (
      <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
        Algolia search not configured. Add VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_SEARCH_API_KEY to enable.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Badge variant="secondary" className="text-xs gap-1">
            <Zap className="h-3 w-3" />
            Instant
          </Badge>
        </div>
      </div>

      {/* Results dropdown */}
      {results.length > 0 && query && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/50">
            <span className="text-xs text-muted-foreground">
              {totalHits} result{totalHits !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {results.map((hit) => (
              <button
                key={hit.objectID}
                onClick={() => handleSelect(hit)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{hit.merchant}</p>
                    <p className="text-sm text-muted-foreground">
                      {hit.category} • {format(new Date(hit.transaction_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`font-semibold ${hit.amount < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                    {formatCurrency(hit.amount)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results state */}
      {query && !isSearching && results.length === 0 && debouncedQuery && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">No transactions found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

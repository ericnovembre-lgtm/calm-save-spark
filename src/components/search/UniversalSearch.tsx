import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Target, CreditCard, PiggyBank, TrendingDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { 
  multiIndexSearch, 
  isAlgoliaConfigured,
  ALGOLIA_INDICES,
  type TransactionHit,
  type GoalHit,
  type SearchHit,
} from '@/lib/algolia-client';
import { AlgoliaSearchBox } from './AlgoliaSearchBox';
import { cn } from '@/lib/utils';

interface UniversalSearchProps {
  onSelectTransaction?: (hit: TransactionHit) => void;
  onSelectGoal?: (hit: GoalHit) => void;
  className?: string;
}

export function UniversalSearch({
  onSelectTransaction,
  onSelectGoal,
  className,
}: UniversalSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Map<string, SearchHit[]> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !user?.id) {
      setResults(null);
      return;
    }

    if (!isAlgoliaConfigured()) {
      console.warn('Algolia is not configured');
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await multiIndexSearch(
        searchQuery,
        user.id,
        [ALGOLIA_INDICES.TRANSACTIONS, ALGOLIA_INDICES.GOALS]
      );
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setIsOpen(newQuery.length > 0);
  }, []);

  const transactionHits = (results?.get(ALGOLIA_INDICES.TRANSACTIONS) || []) as TransactionHit[];
  const goalHits = (results?.get(ALGOLIA_INDICES.GOALS) || []) as GoalHit[];

  const hasResults = transactionHits.length > 0 || goalHits.length > 0;

  if (!isAlgoliaConfigured()) {
    return (
      <div className={cn("relative", className)}>
        <AlgoliaSearchBox
          placeholder="Search (Algolia not configured)"
          onSearch={() => {}}
          isLoading={false}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <AlgoliaSearchBox
        placeholder="Search transactions, goals..."
        onSearch={handleQueryChange}
        value={query}
        onChange={setQuery}
        isLoading={isLoading}
      />

      <AnimatePresence>
        {isOpen && query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-full left-0 right-0 z-50 mt-2",
              "bg-card/95 backdrop-blur-xl",
              "border border-border/50 rounded-xl",
              "shadow-lg overflow-hidden",
              "max-h-[400px] overflow-y-auto"
            )}
          >
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            ) : hasResults ? (
              <div className="p-2">
                {/* Transactions Section */}
                {transactionHits.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <CreditCard className="w-3 h-3" />
                      Transactions
                    </div>
                    {transactionHits.slice(0, 5).map((hit) => (
                      <button
                        key={hit.objectID}
                        onClick={() => onSelectTransaction?.(hit)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-lg",
                          "hover:bg-muted/50 transition-colors text-left"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          hit.amount < 0 
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{hit.merchant}</p>
                          <p className="text-xs text-muted-foreground truncate">{hit.category}</p>
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          hit.amount < 0 ? "text-destructive" : "text-emerald-500"
                        )}>
                          ${Math.abs(hit.amount).toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Goals Section */}
                {goalHits.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Target className="w-3 h-3" />
                      Goals
                    </div>
                    {goalHits.slice(0, 5).map((hit) => {
                      const progress = hit.target_amount > 0 
                        ? (hit.current_amount / hit.target_amount) * 100 
                        : 0;
                      
                      return (
                        <button
                          key={hit.objectID}
                          onClick={() => onSelectGoal?.(hit)}
                          className={cn(
                            "w-full flex items-center gap-3 px-2 py-2 rounded-lg",
                            "hover:bg-muted/50 transition-colors text-left"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <PiggyBank className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{hit.goal_name}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No results found for "{query}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && query && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

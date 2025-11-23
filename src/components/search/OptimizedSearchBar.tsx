/**
 * Optimized Search Bar with Progressive Loading
 * Phase 6: Performance Optimizations
 * 
 * Features:
 * - Debounced input to reduce API calls
 * - Progressive loading of suggestions
 * - Memoized suggestion rendering
 */

import { useState, useRef, useEffect, memo } from 'react';
import { Search, X, Sparkles, History, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/performance-utils';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { useFollowUpSuggestions } from '@/hooks/useFollowUpSuggestions';

interface OptimizedSearchBarProps {
  onSearch: (filters: any, query?: string) => void;
  className?: string;
}

// Memoized suggestion item for better performance
const SuggestionItem = memo(({ 
  suggestion, 
  onClick 
}: { 
  suggestion: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
  >
    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
    <span className="truncate">{suggestion}</span>
  </button>
));

SuggestionItem.displayName = 'SuggestionItem';

// Memoized history item
const HistoryItem = memo(({ 
  query, 
  onClick 
}: { 
  query: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
  >
    <History className="w-3 h-3 text-muted-foreground flex-shrink-0" />
    <span className="truncate">{query}</span>
  </button>
));

HistoryItem.displayName = 'HistoryItem';

export const OptimizedSearchBar = memo(function OptimizedSearchBar({ 
  onSearch, 
  className 
}: OptimizedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [lastFilters, setLastFilters] = useState<any>(null);
  const [resultCount, setResultCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { searchHistory, suggestions, isSearching, executeSearch, clearHistory } = useSmartSearch();
  const { suggestions: followUpSuggestions } = useFollowUpSuggestions(lastQuery, lastFilters, resultCount);

  // Debounced query update to reduce API calls
  useEffect(() => {
    const debouncedUpdate = debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300);

    debouncedUpdate(query);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const filters = await executeSearch(query);
    if (filters) {
      onSearch(filters, query);
      setShowSuggestions(false);
      setLastQuery(query);
      setLastFilters(filters);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    const filters = await executeSearch(suggestion);
    if (filters) {
      onSearch(filters, suggestion);
      setShowSuggestions(false);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSuggestionClick(historyQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Try: 'coffee last week' or 'spent over $50 at Amazon'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 h-11"
          disabled={isSearching}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setQuery('');
                onSearch({});
                inputRef.current?.focus();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            size="sm"
            className="h-7 px-3"
          >
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            {/* Progressive loading of history */}
            <ProgressiveLoader priority="high">
              {searchHistory.length > 0 && (
                <div className="border-b border-border">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <History className="w-3 h-3" />
                      Recent Searches
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearHistory()}
                      className="h-6 px-2 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {searchHistory.map((item) => (
                      <HistoryItem
                        key={item.id}
                        query={item.query}
                        onClick={() => handleHistoryClick(item.query)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </ProgressiveLoader>

            {/* Progressive loading of suggestions */}
            <ProgressiveLoader priority="medium" delay={100}>
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground mb-1">
                  Suggestions
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <SuggestionItem
                      key={index}
                      suggestion={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                    />
                  ))}
                </div>
              </div>
            </ProgressiveLoader>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Follow-up suggestions */}
      {followUpSuggestions.length > 0 && lastQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mt-3"
        >
          <span className="text-xs text-muted-foreground">Try asking:</span>
          {followUpSuggestions.map((suggestion, i) => (
            <Button
              key={i}
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={async () => {
                setQuery(suggestion);
                const filters = await executeSearch(suggestion);
                if (filters) {
                  onSearch(filters, suggestion);
                  setLastQuery(suggestion);
                  setLastFilters(filters);
                }
              }}
            >
              {suggestion}
            </Button>
          ))}
        </motion.div>
      )}
    </div>
  );
});

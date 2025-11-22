import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, History, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { cn } from '@/lib/utils';

interface SmartSearchBarProps {
  onSearch: (filters: any) => void;
  className?: string;
}

export function SmartSearchBar({ onSearch, className }: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { searchHistory, suggestions, isSearching, executeSearch, clearHistory } = useSmartSearch();

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
      onSearch(filters);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    const filters = await executeSearch(suggestion);
    if (filters) {
      onSearch(filters);
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
                    <button
                      key={item.id}
                      onClick={() => handleHistoryClick(item.query)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                    >
                      <History className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{item.query}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground mb-1">
                Suggestions
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

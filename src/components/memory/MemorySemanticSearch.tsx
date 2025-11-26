import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Loader2, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFinancialMemory } from '@/hooks/useFinancialMemory';
import { SearchResultCard } from './SearchResultCard';
import { toast } from 'sonner';

const SUGGESTED_QUERIES = [
  'What are my financial goals?',
  'Show my spending patterns',
  'What preferences have I set?',
  'Recent financial decisions',
];

export function MemorySemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { retrieveMemories, isLoading } = useFinancialMemory();

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setHasSearched(true);
    const memories = await retrieveMemories(q, 5);
    setResults(memories);
  };

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    handleSearch(suggestedQuery);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Ask Your Financial Memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="What are my saving goals? When did I decide to invest?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((suggested) => (
                <Button
                  key={suggested}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuery(suggested)}
                  className="text-xs"
                >
                  {suggested}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {hasSearched && !isLoading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {results.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} relevant {results.length === 1 ? 'memory' : 'memories'}
                  </p>
                  <div className="space-y-3">
                    {results.map((result) => (
                      <SearchResultCard
                        key={result.id}
                        score={result.score}
                        category={result.metadata.category}
                        content={result.metadata.content}
                        timestamp={result.metadata.timestamp}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12 space-y-3"
                >
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <p className="text-foreground font-medium">No memories found</p>
                    <p className="text-sm text-muted-foreground">
                      Try rephrasing your question or storing more financial memories
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

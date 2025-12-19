import { useState } from 'react';
import { Search, RefreshCw, Database, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlgoliaSync } from '@/hooks/useAlgoliaSync';
import { ALGOLIA_INDICES, isAlgoliaConfigured } from '@/lib/algolia-client';
import { toast } from 'sonner';

export function AlgoliaSearchSettings() {
  const { bulkSync, isSyncing } = useAlgoliaSync();
  const [syncingIndex, setSyncingIndex] = useState<string | null>(null);
  const [syncedIndices, setSyncedIndices] = useState<Set<string>>(new Set());

  const isConfigured = isAlgoliaConfigured();

  const handleSync = async (indexName: string) => {
    setSyncingIndex(indexName);
    try {
      await bulkSync.mutateAsync({ indexName: indexName as typeof ALGOLIA_INDICES[keyof typeof ALGOLIA_INDICES] });
      setSyncedIndices(prev => new Set(prev).add(indexName));
    } finally {
      setSyncingIndex(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingIndex('all');
    try {
      for (const index of Object.values(ALGOLIA_INDICES)) {
        await bulkSync.mutateAsync({ indexName: index });
        setSyncedIndices(prev => new Set(prev).add(index));
      }
      toast.success('All indices synced successfully');
    } finally {
      setSyncingIndex(null);
    }
  };

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
        <Search className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Search Not Configured</p>
          <p className="text-xs text-muted-foreground">
            Algolia search credentials are not set up.
          </p>
        </div>
      </div>
    );
  }

  const indices = [
    { key: ALGOLIA_INDICES.TRANSACTIONS, label: 'Transactions', icon: Database },
    { key: ALGOLIA_INDICES.GOALS, label: 'Goals', icon: Database },
    { key: ALGOLIA_INDICES.BUDGETS, label: 'Budgets', icon: Database },
    { key: ALGOLIA_INDICES.DEBTS, label: 'Debts', icon: Database },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Search Index Sync</p>
            <p className="text-xs text-muted-foreground">
              Sync your data to Algolia for fast search
            </p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={handleSyncAll}
          disabled={isSyncing}
        >
          {syncingIndex === 'all' ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync All
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {indices.map(({ key, label, icon: Icon }) => {
          const isSynced = syncedIndices.has(key);
          const isCurrentlySyncing = syncingIndex === key || syncingIndex === 'all';

          return (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="justify-start gap-2"
              onClick={() => handleSync(key)}
              disabled={isSyncing}
            >
              {isCurrentlySyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isSynced ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

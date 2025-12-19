import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAlgoliaSyncStore } from '@/stores/algoliaSyncStore';
import type { AlgoliaIndex } from '@/lib/algolia-client';

interface IndexRecordsParams {
  indexName: AlgoliaIndex;
  records: Array<{ objectID: string; [key: string]: unknown }>;
}

interface DeleteRecordsParams {
  indexName: AlgoliaIndex;
  objectIDs: string[];
}

interface BulkSyncParams {
  indexName: AlgoliaIndex;
}

let operationCounter = 0;
const generateOperationId = (prefix: string) => `${prefix}_${++operationCounter}_${Date.now()}`;

export function useAlgoliaSync() {
  const { startOperation, completeOperation, failOperation } = useAlgoliaSyncStore();

  // Index records mutation
  const indexRecords = useMutation({
    mutationFn: async ({ indexName, records }: IndexRecordsParams) => {
      const operationId = generateOperationId('index');
      startOperation(operationId);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data, error } = await supabase.functions.invoke('algolia-admin', {
          body: {
            action: 'index',
            indexName,
            records,
          },
        });

        if (error) throw error;
        completeOperation(operationId);
        return data;
      } catch (error) {
        failOperation(operationId, indexName, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    onError: (error) => {
      console.error('Failed to index records:', error);
      toast.error('Failed to sync with search');
    },
  });

  // Delete records mutation
  const deleteRecords = useMutation({
    mutationFn: async ({ indexName, objectIDs }: DeleteRecordsParams) => {
      const operationId = generateOperationId('delete');
      startOperation(operationId);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data, error } = await supabase.functions.invoke('algolia-admin', {
          body: {
            action: 'delete',
            indexName,
            objectIDs,
          },
        });

        if (error) throw error;
        completeOperation(operationId);
        return data;
      } catch (error) {
        failOperation(operationId, indexName, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    onError: (error) => {
      console.error('Failed to delete records:', error);
      toast.error('Failed to remove from search');
    },
  });

  // Bulk sync mutation
  const bulkSync = useMutation({
    mutationFn: async ({ indexName }: BulkSyncParams) => {
      const operationId = generateOperationId('bulk');
      startOperation(operationId);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data, error } = await supabase.functions.invoke('algolia-admin', {
          body: {
            action: 'bulk_sync',
            indexName,
          },
        });

        if (error) throw error;
        completeOperation(operationId);
        return data;
      } catch (error) {
        failOperation(operationId, indexName, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Search index synced successfully');
    },
    onError: (error) => {
      console.error('Failed to bulk sync:', error);
      toast.error('Failed to sync search index');
    },
  });

  // Clear user's records from index
  const clearIndex = useMutation({
    mutationFn: async ({ indexName }: BulkSyncParams) => {
      const operationId = generateOperationId('clear');
      startOperation(operationId);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data, error } = await supabase.functions.invoke('algolia-admin', {
          body: {
            action: 'clear',
            indexName,
          },
        });

        if (error) throw error;
        completeOperation(operationId);
        return data;
      } catch (error) {
        failOperation(operationId, indexName, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Search index cleared');
    },
    onError: (error) => {
      console.error('Failed to clear index:', error);
      toast.error('Failed to clear search index');
    },
  });

  return {
    indexRecords,
    deleteRecords,
    bulkSync,
    clearIndex,
    isIndexing: indexRecords.isPending,
    isDeleting: deleteRecords.isPending,
    isSyncing: bulkSync.isPending,
    isClearing: clearIndex.isPending,
  };
}

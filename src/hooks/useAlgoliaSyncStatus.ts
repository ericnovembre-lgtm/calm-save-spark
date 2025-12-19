import { useAlgoliaSyncStore } from '@/stores/algoliaSyncStore';

export function useAlgoliaSyncStatus() {
  const status = useAlgoliaSyncStore((state) => state.status);
  const pendingOperations = useAlgoliaSyncStore((state) => state.pendingOperations);
  const lastSynced = useAlgoliaSyncStore((state) => state.lastSynced);
  const errors = useAlgoliaSyncStore((state) => state.errors);
  const clearErrors = useAlgoliaSyncStore((state) => state.clearErrors);
  const dismissError = useAlgoliaSyncStore((state) => state.dismissError);

  return {
    status,
    pendingCount: pendingOperations.size,
    lastSynced,
    errors,
    clearErrors,
    dismissError,
    isSyncing: status === 'syncing',
    hasErrors: errors.length > 0,
  };
}

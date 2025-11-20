import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SyncAccountsButtonProps {
  accountId?: string;
  onSyncComplete?: () => void;
}

export function SyncAccountsButton({ accountId, onSyncComplete }: SyncAccountsButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-plaid-transactions', {
        body: accountId ? { account_id: accountId } : {},
      });

      if (error) throw error;

      toast.success(
        `Synced ${data.transactions_synced} transaction(s) from ${data.accounts_synced} account(s)`
      );
      
      onSyncComplete?.();
    } catch (error) {
      console.error('Error syncing accounts:', error);
      toast.error('Failed to sync accounts. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Transactions'}
    </Button>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { withPageMemo } from "@/lib/performance-utils";
import { SyncAccountsButton } from "@/components/accounts/SyncAccountsButton";
import { useQueryClient } from "@tanstack/react-query";

export default withPageMemo(function Transactions() {
  const queryClient = useQueryClient();

  const handleAddTransaction = () => {
    toast.info('Manual transaction entry coming soon!');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon!');
  };

  const handleSyncComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Transactions</h1>
            <p className="text-muted-foreground">Track and manage all your expenses</p>
          </div>
          <div className="flex gap-2">
            <SyncAccountsButton onSyncComplete={handleSyncComplete} />
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddTransaction}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        <TransactionList />
      </div>
    </AppLayout>
  );
}, 'Transactions');

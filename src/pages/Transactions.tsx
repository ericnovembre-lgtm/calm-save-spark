import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VirtualizedTransactionList } from "@/components/transactions/VirtualizedTransactionList";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { withPageMemo } from "@/lib/performance-utils";
import { SyncAccountsButton } from "@/components/accounts/SyncAccountsButton";
import { useQueryClient } from "@tanstack/react-query";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import { ActiveFiltersDisplay } from "@/components/transactions/ActiveFiltersDisplay";

export default withPageMemo(function Transactions() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({});

  const handleAddTransaction = () => {
    toast.info('Manual transaction entry coming soon!');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon!');
  };

  const handleSyncComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (key: string) => {
    setFilters((prev: any) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Transactions</h1>
            <p className="text-muted-foreground">AI-enhanced transaction tracking with smart insights</p>
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

        <SmartSearchBar onSearch={handleSearch} />
        
        <ActiveFiltersDisplay
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        <VirtualizedTransactionList filters={filters} />
      </div>
    </AppLayout>
  );
}, 'Transactions');

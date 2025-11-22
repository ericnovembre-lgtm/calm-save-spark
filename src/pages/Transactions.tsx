import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VirtualizedTransactionList } from "@/components/transactions/VirtualizedTransactionList";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { withPageMemo, usePageCallback } from "@/lib/performance-utils";
import { SyncAccountsButton } from "@/components/accounts/SyncAccountsButton";
import { useQueryClient } from "@tanstack/react-query";
import { OptimizedSearchBar } from "@/components/search/OptimizedSearchBar";
import { ActiveFiltersDisplay } from "@/components/transactions/ActiveFiltersDisplay";
import { ProgressiveLoader } from "@/components/performance/ProgressiveLoader";
import { useWebVitals } from "@/hooks/useWebVitals";
import { usePerformanceBudgetAlerts } from "@/hooks/usePerformanceBudgetAlerts";

export default withPageMemo(function Transactions() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({});

  // Enable performance monitoring
  useWebVitals(true);
  usePerformanceBudgetAlerts(true);

  // Memoized callbacks for better performance
  const handleAddTransaction = usePageCallback(() => {
    toast.info('Manual transaction entry coming soon!');
  }, []);

  const handleExport = usePageCallback(() => {
    toast.info('Export feature coming soon!');
  }, []);

  const handleSyncComplete = usePageCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  }, [queryClient]);

  const handleSearch = usePageCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleRemoveFilter = usePageCallback((key: string) => {
    setFilters((prev: any) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const handleClearAllFilters = usePageCallback(() => {
    setFilters({});
  }, []);

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

        {/* Priority load: Search bar (critical for user interaction) */}
        <ProgressiveLoader priority="high">
          <OptimizedSearchBar onSearch={handleSearch} />
        </ProgressiveLoader>
        
        {/* Progressive load: Filters display */}
        <ProgressiveLoader priority="high" delay={50}>
          <ActiveFiltersDisplay
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        </ProgressiveLoader>

        {/* Progressive load: Transaction list (after critical UI) */}
        <ProgressiveLoader priority="medium" delay={100}>
          <VirtualizedTransactionList 
            filters={filters}
            onClearFilters={handleClearAllFilters}
          />
        </ProgressiveLoader>
      </div>
    </AppLayout>
  );
}, 'Transactions');

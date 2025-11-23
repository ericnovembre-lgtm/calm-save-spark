import { useState, useCallback, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VirtualizedTransactionList } from "@/components/transactions/VirtualizedTransactionList";
import { SearchInsightCard } from "@/components/transactions/SearchInsightCard";
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
import { useOptimizedTransactions } from "@/hooks/useOptimizedTransactions";
import { useSearchInsights } from "@/hooks/useSearchInsights";
import { useRecurringDetection } from "@/hooks/useRecurringDetection";
import { supabase } from "@/integrations/supabase/client";
import { InsightsPanel } from '@/components/transactions/InsightsPanel';
import { ScrollToTopButton } from '@/components/transactions/ScrollToTopButton';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { ExportTransactionsDialog } from '@/components/transactions/ExportTransactionsDialog';
import { AnomalyScanner } from '@/components/transactions/AnomalyScanner';
import { useTransactionAnomalyDetection } from "@/hooks/useTransactionAnomalyDetection";

export default withPageMemo(function Transactions() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userId, setUserId] = useState<string>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  // Anomaly detection
  const { anomalies } = useTransactionAnomalyDetection('30d');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  useRecurringDetection(userId);
  useWebVitals(true);
  usePerformanceBudgetAlerts(true);

  const { data: transactionData } = useOptimizedTransactions(filters);
  const allTransactions = useMemo(
    () => transactionData?.pages.flatMap(page => page.transactions) ?? [],
    [transactionData?.pages]
  );

  const hasActiveSearch = searchQuery && Object.keys(filters).length > 0;
  const { data: insightData } = useSearchInsights(
    hasActiveSearch
      ? { query: searchQuery, transactions: allTransactions, filters }
      : null
  );

  const handleAddTransaction = usePageCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const handleExport = usePageCallback(() => {
    setIsExportDialogOpen(true);
  }, []);

  const handleSyncComplete = usePageCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  }, [queryClient]);

  const handleSearch = usePageCallback((newFilters: any, query?: string) => {
    setFilters(newFilters);
    if (query) setSearchQuery(query);
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
    setSearchQuery('');
  }, []);

  return (
    <>
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

        <ProgressiveLoader priority="high">
          <OptimizedSearchBar onSearch={handleSearch} />
        </ProgressiveLoader>
        
        <ProgressiveLoader priority="high" delay={50}>
          <ActiveFiltersDisplay
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        </ProgressiveLoader>

        {insightData && hasActiveSearch && (
          <SearchInsightCard
            query={searchQuery}
            totalAmount={insightData.totalAmount}
            transactionCount={insightData.transactionCount}
            dateRange={
              insightData.dateRange
                ? {
                    start: new Date(insightData.dateRange.start),
                    end: new Date(insightData.dateRange.end),
                  }
                : undefined
            }
            insights={insightData.insight}
            onRefineSearch={() => toast.info('Refine search coming soon!')}
            onSaveReport={() => toast.info('Save report coming soon!')}
          />
        )}

        <ProgressiveLoader priority="medium" delay={100}>
          <VirtualizedTransactionList 
            filters={filters}
            anomalies={anomalies}
            onClearFilters={handleClearAllFilters}
          />
        </ProgressiveLoader>
      </div>
    </AppLayout>

    {userId && <InsightsPanel userId={userId} />}
      
      {/* Anomaly Scanner FAB */}
      <AnomalyScanner />
      
      <ScrollToTopButton />

    <AddTransactionDialog
      isOpen={isAddDialogOpen}
      onClose={() => setIsAddDialogOpen(false)}
    />
    
    <ExportTransactionsDialog
      isOpen={isExportDialogOpen}
      onClose={() => setIsExportDialogOpen(false)}
      transactions={allTransactions}
      filters={filters}
    />
  </>
  );
}, 'Transactions');

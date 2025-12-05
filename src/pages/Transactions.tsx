import { useState, useCallback, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VirtualizedTransactionList } from "@/components/transactions/VirtualizedTransactionList";
import { SearchInsightCard } from "@/components/transactions/SearchInsightCard";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";
import { withPageMemo, usePageCallback } from "@/lib/performance-utils";
import { SyncAccountsButton } from "@/components/accounts/SyncAccountsButton";
import { useQueryClient } from "@tanstack/react-query";
import { OptimizedSearchBar } from "@/components/search/OptimizedSearchBar";
import { ActiveFiltersDisplay } from "@/components/transactions/ActiveFiltersDisplay";
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
import { ImportTransactionsDialog } from '@/components/transactions/ImportTransactionsDialog';
import { RefineSearchDialog } from '@/components/transactions/RefineSearchDialog';
import { SaveReportDialog } from '@/components/transactions/SaveReportDialog';
import { AnomalyScanner } from '@/components/transactions/AnomalyScanner';
import { useTransactionAnomalyDetection } from "@/hooks/useTransactionAnomalyDetection";

export default withPageMemo(function Transactions() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userId, setUserId] = useState<string>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isRefineSearchOpen, setIsRefineSearchOpen] = useState(false);
  const [isSaveReportOpen, setIsSaveReportOpen] = useState(false);
  
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
  const { data: insightData, isLoading: insightsLoading } = useSearchInsights(
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

  const handleRefineSearch = usePageCallback(() => {
    setIsRefineSearchOpen(true);
  }, []);

  const handleSaveReport = usePageCallback(() => {
    setIsSaveReportOpen(true);
  }, []);

  const handleApplyRefinement = usePageCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  return (
    <>
      <AppLayout>
        <div className="space-y-6 pb-8" data-copilot-id="transactions-page">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                Transactions
              </h1>
              <p className="text-muted-foreground">
                AI-enhanced transaction tracking with smart insights
              </p>
            </div>
            <div className="flex gap-2" data-copilot-id="transaction-actions">
              <SyncAccountsButton onSyncComplete={handleSyncComplete} />
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} data-copilot-id="import-transactions">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExport} data-copilot-id="export-transactions">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleAddTransaction} data-copilot-id="add-transaction-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          <div data-copilot-id="transaction-search">
            <OptimizedSearchBar onSearch={handleSearch} />
          </div>

          <div data-copilot-id="transaction-filters">
            <ActiveFiltersDisplay
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>

          {hasActiveSearch && (
            <SearchInsightCard
              query={searchQuery}
              totalAmount={insightData?.totalAmount ?? 0}
              transactionCount={insightData?.transactionCount ?? allTransactions.length}
              dateRange={
                insightData?.dateRange
                  ? {
                      start: new Date(insightData.dateRange.start),
                      end: new Date(insightData.dateRange.end),
                    }
                  : undefined
              }
              insights={insightData?.insight}
              onRefineSearch={handleRefineSearch}
              onSaveReport={handleSaveReport}
              isLoading={insightsLoading}
            />
          )}

          <div data-copilot-id="transaction-list">
            <VirtualizedTransactionList
              filters={filters}
              anomalies={anomalies}
              onClearFilters={handleClearAllFilters}
            />
          </div>
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

    <ImportTransactionsDialog
      isOpen={isImportDialogOpen}
      onClose={() => setIsImportDialogOpen(false)}
    />

    {hasActiveSearch && (
      <>
        <RefineSearchDialog
          query={searchQuery}
          currentFilters={filters}
          transactionCount={allTransactions.length}
          isOpen={isRefineSearchOpen}
          onClose={() => setIsRefineSearchOpen(false)}
          onApplyRefinement={handleApplyRefinement}
        />

        <SaveReportDialog
          query={searchQuery}
          filters={filters}
          transactionCount={allTransactions.length}
          isOpen={isSaveReportOpen}
          onClose={() => setIsSaveReportOpen(false)}
        />
      </>
    )}
  </>
  );
}, 'Transactions');

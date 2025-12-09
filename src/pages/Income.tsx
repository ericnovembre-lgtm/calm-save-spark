import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIncomeEntries, IncomeEntry, CreateIncomeEntry } from '@/hooks/useIncomeEntries';
import { useIncomeAnalytics } from '@/hooks/useIncomeAnalytics';
import { IncomeHero } from '@/components/income/IncomeHero';
import { IncomeSourcesList } from '@/components/income/IncomeSourcesList';
import { IncomeBreakdownChart } from '@/components/income/IncomeBreakdownChart';
import { IncomeProjections } from '@/components/income/IncomeProjections';
import { IncomeVsExpenses } from '@/components/income/IncomeVsExpenses';
import { AddIncomeModal } from '@/components/income/AddIncomeModal';
import { IncomeCalendar } from '@/components/income/IncomeCalendar';
import { IncomeTrends } from '@/components/income/IncomeTrends';
import { Skeleton } from '@/components/ui/skeleton';

export default function Income() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);

  const { 
    incomeEntries, 
    isLoading, 
    addIncome, 
    updateIncome, 
    deleteIncome, 
    toggleActive,
    refetch 
  } = useIncomeEntries();

  const analytics = useIncomeAnalytics();

  const handleSave = (data: CreateIncomeEntry) => {
    if (editingEntry) {
      updateIncome.mutate({ id: editingEntry.id, ...data }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }
      });
    } else {
      addIncome.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    }
  };

  const handleEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this income source?')) {
      deleteIncome.mutate(id);
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActive.mutate({ id, is_active: isActive });
  };

  // Mock monthly expenses (in real app, would come from transactions)
  const monthlyExpenses = analytics.totalMonthly * 0.75;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto p-4 space-y-6">
          <Skeleton className="h-[180px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto p-4 space-y-6" data-copilot-id="income-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-amber-500" />
              Income Tracking
            </h1>
            <p className="text-muted-foreground">
              Track and manage all your income sources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/net-worth">
                View Net Worth
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <IncomeHero
          totalMonthly={analytics.totalMonthly}
          totalAnnual={analytics.totalAnnual}
          totalMonthlyAfterTax={analytics.totalMonthlyAfterTax}
          sourceCount={analytics.sourceCount}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sources List */}
          <div className="lg:col-span-2 space-y-6">
            <IncomeSourcesList
              entries={incomeEntries}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />

            {analytics.sourceCount > 0 && (
              <IncomeVsExpenses
                monthlyIncome={analytics.totalMonthly}
                monthlyExpenses={monthlyExpenses}
              />
            )}
          </div>

          {/* Right Column - Charts & Calendar */}
          <div className="space-y-6">
            <IncomeBreakdownChart byType={analytics.byType} />
            <IncomeCalendar entries={incomeEntries} />
          </div>
        </div>

        {/* Bottom Section - Projections & Trends */}
        {analytics.sourceCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IncomeProjections 
              projections={analytics.projections} 
              totalMonthly={analytics.totalMonthly}
            />
            <IncomeTrends totalMonthly={analytics.totalMonthly} />
          </div>
        )}

        {/* Add/Edit Modal */}
        <AddIncomeModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingEntry(null);
          }}
          onSave={handleSave}
          editEntry={editingEntry}
          isLoading={addIncome.isPending || updateIncome.isPending}
        />
      </div>
    </AppLayout>
  );
}

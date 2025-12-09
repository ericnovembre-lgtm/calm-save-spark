import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wallet, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNetWorthSnapshots } from '@/hooks/useNetWorthSnapshots';
import { useNetWorthMilestones } from '@/hooks/useNetWorthMilestones';
import { NetWorthHero } from '@/components/net-worth/NetWorthHero';
import { NetWorthTrendChart } from '@/components/net-worth/NetWorthTrendChart';
import { AssetBreakdownCard } from '@/components/net-worth/AssetBreakdownCard';
import { LiabilityBreakdownCard } from '@/components/net-worth/LiabilityBreakdownCard';
import { NetWorthMilestones } from '@/components/net-worth/NetWorthMilestones';
import { NetWorthComparison } from '@/components/net-worth/NetWorthComparison';
import { NetWorthProjection } from '@/components/net-worth/NetWorthProjection';
import { TakeSnapshotButton } from '@/components/net-worth/TakeSnapshotButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export default function NetWorth() {
  const {
    snapshots,
    latestSnapshot,
    changeFromPrevious,
    changePercentage,
    weekChange,
    monthChange,
    yearChange,
    isLoading,
    refetch,
    createSnapshot,
  } = useNetWorthSnapshots();

  const {
    milestones,
    isLoading: milestonesLoading,
    getMilestoneLabel,
    getMilestoneIcon,
  } = useNetWorthMilestones();

  // Calculate monthly growth rate based on historical data
  const monthlyGrowth = useMemo(() => {
    if (snapshots.length < 2) return 0;
    
    const recentSnapshots = snapshots.slice(0, Math.min(6, snapshots.length));
    if (recentSnapshots.length < 2) return 0;

    const totalChange = recentSnapshots[0].net_worth - recentSnapshots[recentSnapshots.length - 1].net_worth;
    const months = recentSnapshots.length - 1;
    
    return totalChange / months;
  }, [snapshots]);

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

  const currentNetWorth = latestSnapshot?.net_worth ?? 0;
  const totalAssets = latestSnapshot?.total_assets ?? 0;
  const totalLiabilities = latestSnapshot?.total_liabilities ?? 0;
  const assetBreakdown = latestSnapshot?.asset_breakdown ?? {};
  const liabilityBreakdown = latestSnapshot?.liability_breakdown ?? {};

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto p-4 space-y-6" data-copilot-id="net-worth-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="w-6 h-6 text-green-500" />
              Net Worth Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your total financial position over time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/income">
                <DollarSign className="w-4 h-4 mr-1" />
                Income
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <TakeSnapshotButton
              onSnapshot={(data) => createSnapshot.mutate(data)}
              isLoading={createSnapshot.isPending}
              defaultAssets={totalAssets}
              defaultLiabilities={totalLiabilities}
            />
          </div>
        </div>

        {/* Hero Section */}
        <NetWorthHero
          netWorth={currentNetWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          changeFromPrevious={changeFromPrevious}
          changePercentage={changePercentage}
        />

        {/* Period Comparison */}
        <NetWorthComparison
          weekChange={weekChange}
          monthChange={monthChange}
          yearChange={yearChange}
          currentNetWorth={currentNetWorth}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <NetWorthTrendChart snapshots={snapshots} />
            <NetWorthProjection 
              currentNetWorth={currentNetWorth} 
              monthlyGrowth={monthlyGrowth}
            />
          </div>

          {/* Right Column - Breakdowns & Milestones */}
          <div className="space-y-6">
            <AssetBreakdownCard 
              breakdown={assetBreakdown} 
              total={totalAssets} 
            />
            <LiabilityBreakdownCard 
              breakdown={liabilityBreakdown} 
              total={totalLiabilities} 
            />
            <NetWorthMilestones
              milestones={milestones}
              getMilestoneLabel={getMilestoneLabel}
              getMilestoneIcon={getMilestoneIcon}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

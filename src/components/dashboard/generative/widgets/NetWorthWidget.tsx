import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ArrowRight, Landmark, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNetWorthSnapshots } from '@/hooks/useNetWorthSnapshots';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function NetWorthWidget() {
  const { snapshots, isLoading } = useNetWorthSnapshots();

  const stats = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      return { netWorth: 0, assets: 0, liabilities: 0, change: 0 };
    }
    
    const latest = snapshots[0];
    const previous = snapshots.length > 1 ? snapshots[1] : null;
    
    const netWorth = (latest.total_assets || 0) - (latest.total_liabilities || 0);
    const previousNetWorth = previous 
      ? (previous.total_assets || 0) - (previous.total_liabilities || 0)
      : netWorth;
    
    const change = previousNetWorth !== 0 
      ? ((netWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100 
      : 0;

    return {
      netWorth,
      assets: latest.total_assets || 0,
      liabilities: latest.total_liabilities || 0,
      change
    };
  }, [snapshots]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-3" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Net Worth
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            asChild
          >
            <Link to="/net-worth">
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <p className={cn(
              "text-2xl font-bold",
              stats.netWorth >= 0 ? "text-foreground" : "text-rose-500"
            )}>
              ${Math.abs(stats.netWorth).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            
            {stats.change !== 0 && (
              <span className={cn(
                "text-xs flex items-center gap-0.5",
                stats.change > 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                <TrendingUp className={cn(
                  "w-3 h-3",
                  stats.change < 0 && "rotate-180"
                )} />
                {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-emerald-600">
              <Landmark className="w-3 h-3" />
              ${stats.assets.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <CreditCard className="w-3 h-3" />
              ${stats.liabilities.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NetWorthWidget;

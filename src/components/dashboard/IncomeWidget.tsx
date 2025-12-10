import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIncomeAnalytics } from '@/hooks/useIncomeAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

export function IncomeWidget() {
  const { totalMonthly, sourceCount, isLoading } = useIncomeAnalytics();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const monthlyTotal = totalMonthly || 0;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Monthly Income
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            asChild
          >
            <Link to="/income">
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold">
            ${monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              {sourceCount} source{sourceCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default IncomeWidget;

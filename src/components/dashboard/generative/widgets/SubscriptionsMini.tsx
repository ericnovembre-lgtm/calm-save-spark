import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionsMiniProps {
  userId?: string;
}

interface Subscription {
  id: string;
  merchant: string | null;
  avg_amount: number | null;
  expected_date: number | null;
}

const SubscriptionsMini = ({ userId }: SubscriptionsMiniProps) => {
  const { data: subscriptions } = useQuery({
    queryKey: ['recurring-subscriptions', userId],
    queryFn: async (): Promise<Subscription[]> => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from('recurring_transactions')
        .select('id, merchant, avg_amount, expected_date')
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) return [];
      return data || [];
    },
    enabled: !!userId
  });

  const monthlyTotal = subscriptions?.reduce((sum, s) => {
    return sum + Math.abs(Number(s.avg_amount) || 0);
  }, 0) || 0;

  const today = new Date();
  const currentDayOfMonth = today.getDate();
  
  const upcomingCount = subscriptions?.filter(s => {
    if (!s.expected_date) return false;
    const expectedDay = s.expected_date;
    const daysUntilDue = expectedDay >= currentDayOfMonth 
      ? expectedDay - currentDayOfMonth 
      : 30 - currentDayOfMonth + expectedDay;
    return daysUntilDue <= 7;
  }).length || 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Subscriptions
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold">
            ${monthlyTotal.toFixed(0)}
          </div>
          <p className="text-xs text-muted-foreground">monthly recurring</p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Active subscriptions</span>
          <span className="font-medium">{subscriptions?.length || 0}</span>
        </div>

        {upcomingCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
            <AlertCircle className="h-3 w-3" />
            {upcomingCount} due this week
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionsMini;

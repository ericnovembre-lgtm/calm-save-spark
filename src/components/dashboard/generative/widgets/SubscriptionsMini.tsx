import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionsMiniProps {
  userId?: string;
}

const SubscriptionsMini = ({ userId }: SubscriptionsMiniProps) => {
  const { data: subscriptions } = useQuery({
    queryKey: ['recurring-bills', userId],
    queryFn: async () => {
      if (!userId) return [];
      // Use upcoming_bills table instead
      const { data } = await supabase
        .from('upcoming_bills')
        .select('id, bill_name, amount, due_date, is_recurring')
        .eq('user_id', userId)
        .eq('is_recurring', true);
      return data || [];
    },
    enabled: !!userId
  });

  const monthlyTotal = subscriptions?.reduce((sum, s) => {
    return sum + Math.abs(Number(s.amount) || 0);
  }, 0) || 0;

  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  
  const upcomingCount = subscriptions?.filter(s => {
    if (!s.due_date) return false;
    const dueDate = new Date(s.due_date);
    return dueDate >= today && dueDate <= weekFromNow;
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

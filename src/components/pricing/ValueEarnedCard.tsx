import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValueEarnedCardProps {
  userId: string;
  currentMonthlyContribution: number;
  projectedTier: number;
}

export default function ValueEarnedCard({ 
  userId, 
  currentMonthlyContribution, 
  projectedTier 
}: ValueEarnedCardProps) {
  const [totalContributed, setTotalContributed] = useState(0);
  const [monthsActive, setMonthsActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateValue();
  }, [userId]);

  const calculateValue = async () => {
    try {
      // Get user's subscription history
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('created_at, subscription_amount')
        .eq('user_id', userId)
        .single();

      if (subscription) {
        // Calculate months since subscription
        const createdDate = new Date(subscription.created_at);
        const now = new Date();
        const months = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        
        setMonthsActive(months);
        
        // Simplified calculation: current amount * months
        // In production, you'd query subscription_history for accurate totals
        const estimated = subscription.subscription_amount * months;
        setTotalContributed(estimated);
      }
    } catch (error) {
      console.error('Error calculating value:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEncouragementMessage = () => {
    const increase = projectedTier - currentMonthlyContribution;
    
    if (increase > 0) {
      return `Upgrading to $${projectedTier}/mo unlocks ${increase} more feature${increase === 1 ? '' : 's'}!`;
    } else if (increase < 0) {
      return `Adjusting to $${projectedTier}/mo. Your support means everything!`;
    } else {
      return 'Thank you for your continued support!';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            Your Impact
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            {monthsActive} month{monthsActive === 1 ? '' : 's'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold text-primary">
              ${totalContributed}
            </div>
            <p className="text-sm text-muted-foreground">
              Total contributed to $ave+
            </p>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {getEncouragementMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

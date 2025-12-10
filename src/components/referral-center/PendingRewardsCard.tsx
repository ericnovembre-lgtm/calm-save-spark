import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReferralRewards } from '@/hooks/useReferrals';
import { Gift, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function PendingRewardsCard() {
  const { rewards, stats, claimReward } = useReferralRewards();

  const pendingRewards = rewards.filter(r => r.status === 'available' || r.status === 'pending');
  const pendingAmount = stats?.pendingRewards || 0;

  if (pendingRewards.length === 0 && pendingAmount === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-2 border-dashed border-primary/30">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-amber-100">
          <Gift className="w-6 h-6 text-amber-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Pending Rewards</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You have rewards waiting to be claimed!
          </p>

          {pendingAmount > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold text-primary">
                ${pendingAmount.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">available</span>
            </div>
          )}

          {pendingRewards.length > 0 && (
            <div className="space-y-2">
              {pendingRewards.map(reward => (
                <div 
                  key={reward.id} 
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium">${reward.reward_value}</p>
                    <p className="text-xs text-muted-foreground">
                      {reward.reward_type}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {reward.expires_at && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Expires {format(new Date(reward.expires_at), 'MMM d')}
                      </Badge>
                    )}
                    {reward.status === 'available' && (
                      <Button
                        size="sm"
                        onClick={() => claimReward.mutate()}
                        disabled={claimReward.isPending}
                      >
                        Claim
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Referral } from '@/hooks/useReferrals';
import { format } from 'date-fns';
import { User, Clock, CheckCircle, Gift } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  expired: { color: 'bg-gray-100 text-gray-700', icon: Clock },
};

interface ReferralHistoryListProps {
  referrals: Referral[];
}

export function ReferralHistoryList({ referrals }: ReferralHistoryListProps) {
  if (referrals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No referrals yet</h3>
        <p className="text-sm text-muted-foreground">
          Share your referral link to start earning rewards
        </p>
      </Card>
    );
  }

  return (
    <Card className="divide-y">
      {referrals.map(referral => {
        const status = statusConfig[referral.status] || statusConfig.pending;
        const StatusIcon = status.icon;

        return (
          <div key={referral.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">
                  {referral.referred_email || 'Invited User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(referral.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {referral.reward_amount && referral.rewarded_at && (
                <div className="flex items-center gap-1 text-green-600">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    ${referral.reward_amount}
                  </span>
                </div>
              )}
              <Badge variant="secondary" className={status.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {referral.status}
              </Badge>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
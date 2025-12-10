import { Card } from '@/components/ui/card';
import { useReferralRewards } from '@/hooks/useReferrals';
import { Users, Clock, DollarSign, Gift } from 'lucide-react';
import CountUp from 'react-countup';

export function ReferralStats() {
  const { stats, isLoading } = useReferralRewards();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-muted rounded mb-2" />
              <div className="h-6 bg-muted rounded w-1/2 mb-1" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      value: stats.totalReferrals,
      label: 'Total Referrals',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Clock,
      value: stats.pending,
      label: 'Pending',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
    },
    {
      icon: Gift,
      value: stats.completed,
      label: 'Completed',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      icon: DollarSign,
      value: stats.totalEarned,
      label: 'Total Earned',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      prefix: '$',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map(stat => (
        <Card key={stat.label} className="p-4">
          <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-2`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold">
            {stat.prefix}
            <CountUp end={stat.value} duration={1} />
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  merchant_name: string;
  ai_merchant_name: string | null;
  amount_cents: number;
  next_expected_date: string | null;
  status: string;
}

interface UpcomingChargesCardProps {
  subscriptions: Subscription[];
}

export function UpcomingChargesCard({ subscriptions }: UpcomingChargesCardProps) {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingCharges = subscriptions
    .filter(sub => sub.status === 'active' && sub.next_expected_date)
    .filter(sub => {
      const chargeDate = new Date(sub.next_expected_date!);
      return chargeDate >= now && chargeDate <= sevenDaysFromNow;
    })
    .sort((a, b) => 
      new Date(a.next_expected_date!).getTime() - new Date(b.next_expected_date!).getTime()
    );

  const totalUpcoming = upcomingCharges.reduce((sum, sub) => sum + sub.amount_cents, 0) / 100;

  if (upcomingCharges.length === 0) {
    return null;
  }

  const getDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const getUrgencyColor = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 1) return 'text-red-600 border-red-600/30 bg-red-50 dark:bg-red-950/20';
    if (days <= 3) return 'text-amber-600 border-amber-600/30 bg-amber-50 dark:bg-amber-950/20';
    return 'text-blue-600 border-blue-600/30 bg-blue-50 dark:bg-blue-950/20';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Upcoming Charges</CardTitle>
              <p className="text-sm text-muted-foreground">Next 7 days</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-bold">
              <TrendingUp className="w-4 h-4" />
              ${totalUpcoming.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{upcomingCharges.length} charges</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {upcomingCharges.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {sub.ai_merchant_name || sub.merchant_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sub.next_expected_date!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="font-semibold">${(sub.amount_cents / 100).toFixed(2)}</p>
                  <Badge 
                    variant="outline"
                    className={getUrgencyColor(sub.next_expected_date!)}
                  >
                    {getDaysUntil(sub.next_expected_date!)}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
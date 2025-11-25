import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Database } from '@/integrations/supabase/types';

type PointsRedemption = Database['public']['Tables']['points_redemptions']['Row'];

interface RedemptionHistoryListProps {
  history: PointsRedemption[];
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/10', label: 'Pending' },
  processing: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Processing' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10', label: 'Failed' },
  cancelled: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-500/10', label: 'Cancelled' },
};

export function RedemptionHistoryList({ history }: RedemptionHistoryListProps) {
  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <p className="mb-2">No redemption history yet</p>
          <p className="text-sm">Start redeeming your points to see your history here</p>
        </div>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {history.map((redemption, index) => {
          const config = statusConfig[redemption.status as keyof typeof statusConfig] || statusConfig.pending;
          const StatusIcon = config.icon;
          const fulfillment = redemption.fulfillment_details as any;

          return (
            <motion.div
              key={redemption.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{fulfillment?.catalog_name || 'Redemption'}</h4>
                      {fulfillment?.partner_name && (
                        <p className="text-sm text-muted-foreground">{fulfillment.partner_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(redemption.created_at).toLocaleDateString()} at{' '}
                        {new Date(redemption.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={config.bg}>
                    {config.label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <div>
                    <p className="text-muted-foreground">Points Used</p>
                    <p className="font-semibold">{redemption.points_spent.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-semibold text-primary">${redemption.dollar_value}</p>
                  </div>
                </div>

                {/* Fulfillment Details */}
                {redemption.status === 'completed' && fulfillment && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                    {fulfillment.gift_card_code && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Gift Card Code</p>
                        <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                          {fulfillment.gift_card_code}
                        </code>
                      </div>
                    )}
                    {fulfillment.credit_code && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Credit Code</p>
                        <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                          {fulfillment.credit_code}
                        </code>
                      </div>
                    )}
                    {fulfillment.instructions && (
                      <p className="text-xs text-muted-foreground">{fulfillment.instructions}</p>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

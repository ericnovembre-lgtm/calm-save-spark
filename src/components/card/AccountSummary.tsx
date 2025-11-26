import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';
import { format, differenceInDays } from 'date-fns';
import { useState } from 'react';
import { CardPaymentModal } from './CardPaymentModal';

type CardAccount = Database['public']['Tables']['card_accounts']['Row'];

interface AccountSummaryProps {
  account: CardAccount;
  onMakePayment?: () => void;
}

export function AccountSummary({ account, onMakePayment }: AccountSummaryProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const utilization = account.credit_limit_cents > 0
    ? ((account.credit_limit_cents - account.available_cents) / account.credit_limit_cents) * 100
    : 0;

  const currentBalance = account.current_balance_cents || 0;
  const minimumPayment = account.minimum_payment_cents || 0;
  const dueDate = account.next_due_date;
  const daysUntilDue = dueDate ? differenceInDays(new Date(dueDate), new Date()) : null;

  const getUtilizationColor = (util: number) => {
    if (util < 30) return 'text-green-600';
    if (util < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDueDateStatus = () => {
    if (!daysUntilDue) return null;
    if (daysUntilDue < 0) return { color: 'text-red-600', label: 'Overdue', variant: 'destructive' as const };
    if (daysUntilDue <= 3) return { color: 'text-orange-600', label: 'Due Soon', variant: 'secondary' as const };
    return { color: 'text-blue-600', label: 'On Track', variant: 'default' as const };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Account Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted text-center">
              <div className="text-2xl font-bold text-foreground">
                ${(account.available_cents / 100).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Available Credit</div>
            </div>

            <div className="p-4 rounded-lg bg-muted text-center">
              <div className="text-2xl font-bold text-foreground">
                ${(account.credit_limit_cents / 100).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Credit Limit</div>
            </div>

            <div className="p-4 rounded-lg bg-muted text-center">
              <div className={`text-2xl font-bold ${getUtilizationColor(utilization)}`}>
                {utilization.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Utilization</div>
            </div>
          </div>

          {currentBalance > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-muted-foreground">Current Balance</div>
                  <div className="text-2xl font-bold">${(currentBalance / 100).toFixed(2)}</div>
                </div>
                {dueDate && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      Due {format(new Date(dueDate), 'MMM d')}
                    </div>
                    {dueDateStatus && (
                      <Badge variant={dueDateStatus.variant} className="mt-1">
                        {dueDateStatus.label}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Minimum Payment</div>
                  <div className="font-semibold">${(minimumPayment / 100).toFixed(2)}</div>
                </div>
                <Button onClick={() => setShowPaymentModal(true)}>
                  Make Payment
                </Button>
              </div>

              {daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 mt-3">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-orange-900 dark:text-orange-100">
                      Payment Due in {daysUntilDue} {daysUntilDue === 1 ? 'Day' : 'Days'}
                    </div>
                    <div className="text-orange-700 dark:text-orange-300 mt-1">
                      Avoid late fees by making a payment before {format(new Date(dueDate), 'MMMM d')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {account.account_type === 'credit' && account.apr_bps && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                <TrendingUp className="w-4 h-4" />
                <span>
                  <strong>Current APR:</strong> {(account.apr_bps / 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CardPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        accountId={account.id}
        currentBalance={currentBalance}
        minimumPayment={minimumPayment}
        dueDate={dueDate || undefined}
      />
    </>
  );
}

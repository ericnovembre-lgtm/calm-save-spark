import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';

type CardAccount = Database['public']['Tables']['card_accounts']['Row'];

interface AccountSummaryProps {
  account: CardAccount;
}

export function AccountSummary({ account }: AccountSummaryProps) {
  const utilization = account.credit_limit_cents > 0
    ? ((account.credit_limit_cents - account.available_cents) / account.credit_limit_cents) * 100
    : 0;

  const getUtilizationColor = (util: number) => {
    if (util < 30) return 'text-green-600';
    if (util < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Account Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
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

        {account.account_type === 'credit' && account.apr_bps && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
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
  );
}

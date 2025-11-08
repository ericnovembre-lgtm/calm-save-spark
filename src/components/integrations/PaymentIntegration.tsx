import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PaymentIntegration() {
  const { data: paymentAccounts } = useQuery({
    queryKey: ['payment-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-xl font-bold">Payment Gateway Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect Stripe, PayPal, Venmo for seamless transfers
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {paymentAccounts && paymentAccounts.length > 0 ? (
            paymentAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{account.account_type}</p>
                    <p className="text-sm text-muted-foreground">{account.account_identifier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold">${parseFloat(account.balance.toString()).toFixed(2)}</p>
                  {account.is_verified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payment accounts connected</p>
              <p className="text-sm mt-1">Add your first payment provider</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <div className="text-xl">💳</div>
            <span className="text-sm">Stripe</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <div className="text-xl">💰</div>
            <span className="text-sm">PayPal</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <div className="text-xl">📱</div>
            <span className="text-sm">Venmo</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
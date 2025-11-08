import { Card } from "@/components/ui/card";
import { PlaidLink } from "@/components/accounts/PlaidLink";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link2, CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function ConnectAccountCard() {
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({
    queryKey: ['connected_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['connected_accounts'] });
  };

  const hasAccounts = (accounts?.length || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/20">
        <div className="flex items-start gap-6">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {hasAccounts ? (
              <CheckCircle2 className="w-8 h-8 text-primary" />
            ) : (
              <Link2 className="w-8 h-8 text-primary" />
            )}
          </motion.div>

          <div className="flex-1">
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              {hasAccounts ? 'Bank Accounts Connected' : 'Connect Your Bank Accounts'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasAccounts 
                ? `You have ${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'} connected. Add more to get a complete financial picture.`
                : 'Link your bank accounts securely with Plaid to automatically track transactions, analyze spending, and optimize your savings.'
              }
            </p>

            {hasAccounts ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground">
                    {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} syncing
                  </span>
                </div>
                <PlaidLink onSuccess={handleSuccess} />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <PlaidLink onSuccess={handleSuccess} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Bank-level security with 256-bit encryption</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {!hasAccounts && (
          <motion.div 
            className="mt-6 pt-6 border-t border-border/50 grid grid-cols-3 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">11,000+</div>
              <div className="text-xs text-muted-foreground">Supported Banks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">Read-Only</div>
              <div className="text-xs text-muted-foreground">Access Only</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">Instant</div>
              <div className="text-xs text-muted-foreground">Connection</div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
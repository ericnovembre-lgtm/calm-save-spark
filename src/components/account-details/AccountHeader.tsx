import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, CreditCard, Wallet, TrendingUp, CircleDollarSign, RefreshCw, Settings } from "lucide-react";
import { AccountDetails } from "@/hooks/useAccountDetails";
import { formatDistanceToNow } from "date-fns";

interface AccountHeaderProps {
  account: AccountDetails;
}

const accountTypeIcons = {
  checking: Wallet,
  savings: CircleDollarSign,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: Building2,
};

const accountTypeColors = {
  checking: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  savings: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  credit_card: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  investment: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  loan: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export function AccountHeader({ account }: AccountHeaderProps) {
  const Icon = accountTypeIcons[account.account_type as keyof typeof accountTypeIcons] || Wallet;
  const colorClass = accountTypeColors[account.account_type as keyof typeof accountTypeColors] || "bg-accent/10 text-accent";
  const balance = account.current_balance || account.balance || 0;
  const isDebt = ['credit_card', 'loan'].includes(account.account_type);

  return (
    <motion.div
      className="bg-card rounded-2xl p-6 border border-border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${colorClass}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {account.nickname || account.institution_name}
              </h1>
              <Badge variant="outline" className="capitalize">
                {account.account_type.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {account.institution_name}
              {account.account_mask && ` •••• ${account.account_mask}`}
            </p>
            {account.last_synced && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced {formatDistanceToNow(new Date(account.last_synced), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className={`text-3xl sm:text-4xl font-bold tabular-nums ${isDebt ? 'text-rose-500' : 'text-foreground'}`}>
            {isDebt ? '-' : ''}${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {account.available_balance !== null && account.available_balance !== balance && (
            <p className="text-sm text-muted-foreground">
              Available: ${account.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          )}
          {account.apy !== null && account.apy > 0 && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              {account.apy.toFixed(2)}% APY
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

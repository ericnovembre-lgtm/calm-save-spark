import { Building2, CreditCard, Wallet, TrendingUp, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountCardProps {
  id: string;
  institutionName: string;
  accountType: string;
  accountMask?: string;
  balance: number;
  currency?: string;
  lastSynced?: string;
  onSync?: (accountId: string) => void;
}

const accountTypeIcons = {
  checking: Wallet,
  savings: CircleDollarSign,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: Building2,
};

export const AccountCard = ({
  id,
  institutionName,
  accountType,
  accountMask,
  balance,
  currency = 'USD',
  lastSynced,
  onSync,
}: AccountCardProps) => {
  const Icon = accountTypeIcons[accountType as keyof typeof accountTypeIcons] || Wallet;
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-accent/20">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{institutionName}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {accountType.replace('_', ' ')}
              {accountMask && ` ****${accountMask}`}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-foreground tabular-nums">
          {currency === 'USD' ? '$' : currency}{' '}
          {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {lastSynced && (
          <span>
            Last synced: {new Date(lastSynced).toLocaleDateString()}
          </span>
        )}
        {onSync && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSync(id)}
            className="h-7 text-xs"
          >
            Sync Now
          </Button>
        )}
      </div>
    </div>
  );
};

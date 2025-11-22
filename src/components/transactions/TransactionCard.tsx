import { format } from "date-fns";
import { Calendar, Sparkles } from "lucide-react";
import { MerchantLogo } from "./MerchantLogo";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  merchant: string | null;
  description: string | null;
  amount: number | string;
  transaction_date: string;
  category: string;
  enrichment_metadata?: any;
  connected_accounts?: {
    institution_name: string;
  } | null;
}

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const amount = parseFloat(String(transaction.amount));
  const metadata = transaction.enrichment_metadata as { ai_cleaned?: boolean; confidence?: number; original_merchant?: string } | undefined;
  const isAIEnriched = metadata?.ai_cleaned;
  const confidence = metadata?.confidence || 0;

  return (
    <GlassCard className="mb-2 p-4 hover:scale-[1.01] transition-transform">
      <div className="flex items-start gap-3">
        <MerchantLogo merchant={transaction.merchant || 'Unknown'} size="md" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground truncate">
              {transaction.merchant || 'Unknown Merchant'}
            </p>
            {isAIEnriched && confidence > 0.8 && (
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
            )}
            <Badge variant="secondary" className="text-xs shrink-0">
              {transaction.category}
            </Badge>
          </div>
          
          {transaction.description && (
            <p className="text-sm text-muted-foreground mb-2 truncate">
              {transaction.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
            </span>
            {transaction.connected_accounts?.institution_name && (
              <span className="truncate">{transaction.connected_accounts.institution_name}</span>
            )}
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <p className={`font-bold text-lg ${
            amount < 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {amount < 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

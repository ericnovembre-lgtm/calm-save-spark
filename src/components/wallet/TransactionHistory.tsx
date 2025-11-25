import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionDetailsModal } from "./TransactionDetailsModal";
import { ChainBadge } from "./ChainBadge";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Wifi
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useWalletTransactionsRealtime } from "@/hooks/useWalletTransactionsRealtime";
import { useState } from "react";
import { useActiveChain } from "@/hooks/useActiveChain";
import { useWalletSettings } from "@/hooks/useWalletSettings";

export function TransactionHistory() {
  const { selectedChain } = useActiveChain();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { settings } = useWalletSettings();
  
  const { data: wallet } = useQuery({
    queryKey: ['user-wallet', selectedChain],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('chain', selectedChain)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['wallet-transactions', wallet?.id],
    queryFn: async () => {
      if (!wallet) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!wallet,
  });

  // Enable real-time updates
  useWalletTransactionsRealtime(wallet?.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmed: "default",
      pending: "secondary",
      failed: "destructive"
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground">
          Your transaction history will appear here once you send or receive crypto
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Live Connection Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Wifi className="w-3 h-3 text-green-500" />
          <span>Live updates enabled</span>
        </div>

        {transactions.map((tx) => (
          <Card 
            key={tx.id} 
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedTransaction(tx)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-muted rounded-full">
                  {tx.transaction_type === 'send' ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold capitalize">
                      {tx.transaction_type}
                    </span>
                    {getStatusIcon(tx.status)}
                    {getStatusBadge(tx.status)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {tx.transaction_type === 'send' ? 'To: ' : 'From: '}
                      <code className="text-xs bg-muted px-1 rounded">
                        {formatAddress(tx.transaction_type === 'send' ? tx.to_address : tx.from_address)}
                      </code>
                    </p>
                    <p className="flex items-center gap-2">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      {tx.chain && <ChainBadge chainId={tx.chain} />}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">
                  {tx.amount.toFixed(4)} {tx.token_symbol}
                </p>
                {settings?.hide_transaction_amounts ? (
                  <p className="text-xs text-muted-foreground">••••••</p>
                ) : (
                  tx.gas_used && tx.gas_price && (
                    <p className="text-xs text-muted-foreground">
                      Gas: {((tx.gas_used * tx.gas_price) / 1e18).toFixed(6)} ETH
                    </p>
                  )
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
}

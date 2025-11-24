import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Clock, ArrowUpRight, ArrowDownLeft, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

interface Transaction {
  id: string;
  hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  token_symbol: string;
  status: string;
  transaction_type: string;
  gas_used?: number;
  gas_price?: number;
  created_at: string;
  chain?: string;
}

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsModal({ transaction, isOpen, onClose }: TransactionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getExplorerUrl = (hash: string, chain?: string) => {
    const explorers = {
      ethereum: `https://etherscan.io/tx/${hash}`,
      polygon: `https://polygonscan.com/tx/${hash}`,
      arbitrum: `https://arbiscan.io/tx/${hash}`,
    };
    return explorers[chain as keyof typeof explorers] || explorers.ethereum;
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'confirmed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <X className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const gasFee = transaction.gas_used && transaction.gas_price
    ? (transaction.gas_used * transaction.gas_price) / 1e18
    : null;

  const totalCost = transaction.transaction_type === 'send' && gasFee
    ? transaction.amount + gasFee
    : transaction.amount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {transaction.transaction_type === 'send' ? (
              <ArrowUpRight className="h-6 w-6 text-red-500" />
            ) : (
              <ArrowDownLeft className="h-6 w-6 text-green-500" />
            )}
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{transaction.status}</p>
              </div>
            </div>
            <Badge variant={
              transaction.status === 'confirmed' ? 'default' :
              transaction.status === 'failed' ? 'destructive' :
              'secondary'
            }>
              {transaction.status}
            </Badge>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-3xl font-bold">
              {transaction.amount.toFixed(6)} {transaction.token_symbol}
            </p>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Transaction Hash</p>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg font-mono text-sm">
              <span className="flex-1 truncate">{transaction.hash}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.hash, 'hash')}
              >
                {copiedField === 'hash' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* From Address */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">From</p>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg font-mono text-sm">
              <span className="flex-1 truncate">{transaction.from_address}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.from_address, 'from')}
              >
                {copiedField === 'from' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* To Address */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">To</p>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg font-mono text-sm">
              <span className="flex-1 truncate">{transaction.to_address}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.to_address, 'to')}
              >
                {copiedField === 'to' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Gas Breakdown */}
          {gasFee && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <p className="font-semibold">Gas Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Used</span>
                  <span className="font-mono">{transaction.gas_used?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Price</span>
                  <span className="font-mono">{transaction.gas_price?.toFixed(9)} ETH</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground font-medium">Total Gas Fee</span>
                  <span className="font-mono font-semibold">{gasFee.toFixed(6)} ETH</span>
                </div>
              </div>
            </div>
          )}

          {/* Total Cost */}
          {transaction.transaction_type === 'send' && gasFee && (
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
              <span className="font-semibold">Total Cost</span>
              <span className="text-xl font-bold">
                {totalCost.toFixed(6)} {transaction.token_symbol}
              </span>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Timestamp</span>
            <span>{format(new Date(transaction.created_at), 'PPpp')}</span>
          </div>

          {/* Chain */}
          {transaction.chain && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Network</span>
              <span className="capitalize">{transaction.chain}</span>
            </div>
          )}

          {/* View on Explorer */}
          <Button
            className="w-full"
            variant="outline"
            onClick={() => window.open(getExplorerUrl(transaction.hash, transaction.chain), '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Block Explorer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromAccount: {
    id: string;
    name: string;
    balance: number;
  };
  toAccount: {
    id: string;
    name: string;
    balance: number;
  };
}

export const TransferDialog = ({ open, onOpenChange, fromAccount, toAccount }: TransferDialogProps) => {
  const [amount, setAmount] = useState(100);
  const [isTransferring, setIsTransferring] = useState(false);
  const queryClient = useQueryClient();

  const maxAmount = Math.floor(fromAccount.balance);
  const suggestedAmounts = [100, 500, 1000, maxAmount / 2].filter(a => a <= maxAmount);

  const handleTransfer = async () => {
    if (amount <= 0 || amount > fromAccount.balance) {
      toast.error('Invalid transfer amount');
      return;
    }

    setIsTransferring(true);

    try {
      const { data, error } = await supabase.functions.invoke('transfer-between-accounts', {
        body: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount,
        },
      });

      if (error) throw error;

      toast.success(`Transferred $${amount.toFixed(2)} successfully`);
      queryClient.invalidateQueries({ queryKey: ['connected_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['liquidity-data'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const newFromBalance = fromAccount.balance - amount;
  const newToBalance = toAccount.balance + amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>
            Move money between your accounts instantly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Account preview */}
          <div className="flex items-center gap-4 justify-between">
            <div className="flex-1 text-center">
              <p className="text-sm text-muted-foreground mb-1">{fromAccount.name}</p>
              <p className="text-lg font-semibold text-foreground">
                ${fromAccount.balance.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                → ${newFromBalance.toFixed(2)}
              </p>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

            <div className="flex-1 text-center">
              <p className="text-sm text-muted-foreground mb-1">{toAccount.name}</p>
              <p className="text-lg font-semibold text-foreground">
                ${toAccount.balance.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                → ${newToBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Amount slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Transfer Amount</Label>
              <span className="text-2xl font-bold text-primary">
                ${amount.toFixed(2)}
              </span>
            </div>

            <Slider
              value={[amount]}
              onValueChange={(values) => setAmount(values[0])}
              min={10}
              max={maxAmount}
              step={10}
              className="w-full"
            />

            {/* Quick amount buttons */}
            <div className="flex gap-2">
              {suggestedAmounts.map((suggested) => (
                <Button
                  key={suggested}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(suggested)}
                  className="flex-1"
                >
                  ${suggested}
                </Button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isTransferring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              className="flex-1"
              disabled={isTransferring || amount <= 0 || amount > fromAccount.balance}
            >
              {isTransferring ? 'Transferring...' : `Transfer $${amount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
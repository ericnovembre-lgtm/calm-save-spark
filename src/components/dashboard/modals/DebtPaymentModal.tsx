import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Banknote, DollarSign, Loader2, TrendingDown } from 'lucide-react';
import { registerModalCallback, unregisterModalCallback } from '@/lib/action-registry';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export function DebtPaymentModal({ isOpen, onClose, onOpen }: DebtPaymentModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDebtId, setSelectedDebtId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Register modal callback for CoPilot integration
  useEffect(() => {
    if (onOpen) {
      registerModalCallback('debt_payment', onOpen);
      return () => unregisterModalCallback('debt_payment');
    }
  }, [onOpen]);

  // Fetch user's active debts
  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('interest_rate', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!user?.id,
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      const debt = debts?.find(d => d.id === selectedDebtId);
      if (!debt) throw new Error('Debt not found');

      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error('Invalid amount');
      }

      const newBalance = Math.max(0, debt.current_balance - paymentAmount);
      const isNowPaidOff = newBalance === 0;

      // Update debt balance
      const { error } = await supabase
        .from('debts')
        .update({ 
          current_balance: newBalance,
          status: isNowPaidOff ? 'paid_off' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDebtId);

      if (error) throw error;
      
      return { debt, paymentAmount, newBalance, isNowPaidOff };
    },
    onSuccess: ({ debt, paymentAmount, newBalance, isNowPaidOff }) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      
      if (isNowPaidOff) {
        toast.success(`🎉 ${debt.debt_name} is paid off!`, {
          description: `You paid the final $${paymentAmount.toFixed(2)}`
        });
      } else {
        toast.success(`Paid $${paymentAmount.toFixed(2)} towards ${debt.debt_name}`, {
          description: `Remaining balance: $${newBalance.toFixed(2)}`
        });
      }
      
      handleClose();
    },
    onError: (error) => {
      toast.error('Failed to record payment', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    },
  });

  const handleClose = () => {
    setSelectedDebtId('');
    setAmount('');
    onClose();
  };

  const selectedDebt = debts?.find(d => d.id === selectedDebtId);
  const payoffProgress = selectedDebt 
    ? Math.round(((selectedDebt.original_balance - selectedDebt.current_balance) / selectedDebt.original_balance) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-500" />
            Make Debt Payment
          </DialogTitle>
          <DialogDescription>
            Pay down your debt and track your progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Debt Selection */}
          <div className="space-y-2">
            <Label htmlFor="debt">Select Debt</Label>
            <Select value={selectedDebtId} onValueChange={setSelectedDebtId}>
              <SelectTrigger>
                <SelectValue placeholder={debtsLoading ? "Loading debts..." : "Choose a debt"} />
              </SelectTrigger>
              <SelectContent>
                {debts?.map(debt => (
                  <SelectItem key={debt.id} value={debt.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{debt.debt_name}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        ${debt.current_balance.toFixed(0)} @ {debt.interest_rate}%
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress Display */}
          {selectedDebt && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payoff Progress</span>
                <span className="font-medium">{payoffProgress}%</span>
              </div>
              <Progress value={payoffProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Paid: ${(selectedDebt.original_balance - selectedDebt.current_balance).toFixed(2)}</span>
                <span>Remaining: ${selectedDebt.current_balance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedDebt && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(selectedDebt.minimum_payment?.toString() || '50')}
                >
                  Min (${selectedDebt.minimum_payment || 50})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(selectedDebt.current_balance.toString())}
                >
                  Pay Off
                </Button>
              </div>
            )}
          </div>

          {/* Interest Saved Estimate */}
          {selectedDebt && amount && parseFloat(amount) > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                Est. interest saved: ${(parseFloat(amount) * (selectedDebt.interest_rate / 100 / 12)).toFixed(2)}/mo
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => paymentMutation.mutate()}
            disabled={!selectedDebtId || !amount || paymentMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {paymentMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              'Make Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

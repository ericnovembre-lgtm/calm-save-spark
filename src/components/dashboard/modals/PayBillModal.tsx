import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Receipt, DollarSign, Loader2, Calendar, CreditCard } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { registerModalCallback, unregisterModalCallback } from '@/lib/action-registry';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export function PayBillModal({ isOpen, onClose, onOpen }: PayBillModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank');

  // Register modal callback for CoPilot integration
  useEffect(() => {
    if (onOpen) {
      registerModalCallback('pay_bill', onOpen);
      return () => unregisterModalCallback('pay_bill');
    }
  }, [onOpen]);

  // Fetch upcoming bills from detected_subscriptions
  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['upcoming-bills', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('detected_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('expected_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!user?.id,
  });

  // Pay bill mutation
  const payBillMutation = useMutation({
    mutationFn: async () => {
      const bill = bills?.find(b => b.id === selectedBillId);
      if (!bill) throw new Error('Bill not found');

      const paymentAmount = parseFloat(amount) || bill.amount;

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: user?.id,
        merchant_name: bill.merchant,
        amount: -paymentAmount,
        category: bill.category || 'Bills',
        transaction_date: new Date().toISOString(),
        description: `Bill payment: ${bill.merchant}`,
      });

      return { bill, paymentAmount };
    },
    onSuccess: ({ bill, paymentAmount }) => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      toast.success(`Paid $${paymentAmount.toFixed(2)} to ${bill.merchant}`, {
        description: `Payment recorded successfully`
      });
      
      handleClose();
    },
    onError: (error) => {
      toast.error('Failed to process payment', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    },
  });

  const handleClose = () => {
    setSelectedBillId('');
    setAmount('');
    setPaymentMethod('bank');
    onClose();
  };

  const selectedBill = bills?.find(b => b.id === selectedBillId);

  // Auto-fill amount when bill is selected
  const handleBillSelect = (billId: string) => {
    setSelectedBillId(billId);
    const bill = bills?.find(b => b.id === billId);
    if (bill) {
      setAmount(bill.amount.toString());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            Pay Bill
          </DialogTitle>
          <DialogDescription>
            Make a quick payment towards your bills.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bill Selection */}
          <div className="space-y-2">
            <Label htmlFor="bill">Select Bill</Label>
            <Select value={selectedBillId} onValueChange={handleBillSelect}>
              <SelectTrigger>
                <SelectValue placeholder={billsLoading ? "Loading bills..." : "Choose a bill"} />
              </SelectTrigger>
              <SelectContent>
                {bills?.map(bill => (
                  <SelectItem key={bill.id} value={bill.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{bill.merchant}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        ${bill.amount.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date Display */}
          {selectedBill && selectedBill.last_charge_date && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Last charged: {format(new Date(selectedBill.last_charge_date), 'MMM d, yyyy')}
              </span>
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
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Bank Account
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Debit Card
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => payBillMutation.mutate()}
            disabled={!selectedBillId || !amount || payBillMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {payBillMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              'Pay Bill'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

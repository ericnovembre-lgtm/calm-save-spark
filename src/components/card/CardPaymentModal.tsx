import { useState } from 'react';
import { DollarSign, Calendar, CreditCard, Zap, Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCardPayments } from '@/hooks/useCardPayments';
import { useCardAccount } from '@/hooks/useCardAccount';

interface CardPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  currentBalance: number;
  minimumPayment: number;
  dueDate?: string;
}

export function CardPaymentModal({
  open,
  onOpenChange,
  accountId,
  currentBalance,
  minimumPayment,
  dueDate,
}: CardPaymentModalProps) {
  const { makePayment, isProcessing, updateAutopay, isUpdatingAutopay } = useCardPayments(accountId);
  const { account } = useCardAccount();
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'minimum' | 'statement' | 'custom'>('statement');
  const [scheduledDate, setScheduledDate] = useState('');
  const [autopayEnabled, setAutopayEnabled] = useState(account?.autopay_enabled || false);
  const [autopayType, setAutopayType] = useState<'minimum' | 'statement'>('minimum');
  const [showCalculator, setShowCalculator] = useState(false);

  const calculateAmount = () => {
    switch (paymentType) {
      case 'minimum':
        return minimumPayment / 100;
      case 'statement':
        return currentBalance / 100;
      case 'custom':
        return parseFloat(paymentAmount) || 0;
      default:
        return 0;
    }
  };

  const handleSubmit = () => {
    const amountCents = Math.round(calculateAmount() * 100);
    
    makePayment({
      accountId,
      amountCents,
      paymentMethod: 'bank_account',
      scheduledDate: scheduledDate || undefined,
    });

    onOpenChange(false);
    resetForm();
  };

  const handleAutopayToggle = () => {
    updateAutopay({
      accountId,
      enabled: !autopayEnabled,
      amountType: autopayType,
    });
    setAutopayEnabled(!autopayEnabled);
  };

  const resetForm = () => {
    setPaymentAmount('');
    setPaymentType('statement');
    setScheduledDate('');
  };

  const calculatePayoffTime = (monthlyPayment: number) => {
    if (monthlyPayment <= 0 || currentBalance <= 0) return 0;
    
    const apr = (account?.apr_bps || 1500) / 10000; // Convert bps to decimal
    const monthlyRate = apr / 12;
    const balance = currentBalance / 100;
    
    if (monthlyPayment <= balance * monthlyRate) {
      return Infinity; // Payment too small to pay off
    }
    
    const months = Math.log(monthlyPayment / (monthlyPayment - balance * monthlyRate)) / 
                   Math.log(1 + monthlyRate);
    
    return Math.ceil(months);
  };

  const amount = calculateAmount();
  const payoffMonths = calculatePayoffTime(amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Choose your payment amount and schedule
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="one-time" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="one-time">One-Time Payment</TabsTrigger>
            <TabsTrigger value="autopay">Autopay</TabsTrigger>
          </TabsList>

          <TabsContent value="one-time" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-3">
                <Label>Payment Amount</Label>
                <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as any)}>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="minimum" id="minimum" />
                      <Label htmlFor="minimum" className="cursor-pointer">
                        Minimum Payment
                      </Label>
                    </div>
                    <span className="font-semibold">${(minimumPayment / 100).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="statement" id="statement" />
                      <Label htmlFor="statement" className="cursor-pointer">
                        Full Balance
                      </Label>
                    </div>
                    <span className="font-semibold">${(currentBalance / 100).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="cursor-pointer">
                        Custom Amount
                      </Label>
                    </div>
                    {paymentType === 'custom' && (
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-32 text-right"
                        min={minimumPayment / 100}
                        max={currentBalance / 100}
                        step="0.01"
                      />
                    )}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-date">Schedule Payment (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {scheduledDate && (
                  <p className="text-sm text-muted-foreground">
                    Payment will be processed on {new Date(scheduledDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {paymentType === 'custom' && amount > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Calculator className="w-4 h-4 mt-0.5 text-blue-600" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-900 dark:text-blue-100">Payoff Calculator</div>
                      <div className="text-blue-700 dark:text-blue-300 mt-1">
                        {payoffMonths === Infinity ? (
                          'Payment too small to pay off balance (covers interest only)'
                        ) : payoffMonths === 1 ? (
                          'This payment will pay off your balance!'
                        ) : (
                          `At $${amount.toFixed(2)}/month, you'll pay off your balance in ${payoffMonths} months`
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Payment Total</span>
                  <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isProcessing || amount <= 0 || (paymentType === 'custom' && amount < minimumPayment / 100)}
                >
                  {isProcessing ? 'Processing...' : scheduledDate ? 'Schedule Payment' : 'Pay Now'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="autopay" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-amber-900 dark:text-amber-100">
                    Never miss a payment
                  </div>
                  <div className="text-amber-700 dark:text-amber-300 mt-1">
                    Autopay automatically pays your bill on the due date each month
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Enable Autopay</div>
                  <div className="text-sm text-muted-foreground">
                    Automatic payments on due date
                  </div>
                </div>
                <Switch
                  checked={autopayEnabled}
                  onCheckedChange={handleAutopayToggle}
                  disabled={isUpdatingAutopay}
                />
              </div>

              {autopayEnabled && (
                <div className="space-y-3">
                  <Label>Autopay Amount</Label>
                  <RadioGroup value={autopayType} onValueChange={(v) => setAutopayType(v as any)}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="minimum" id="auto-minimum" />
                      <Label htmlFor="auto-minimum" className="cursor-pointer flex-1">
                        <div>Minimum Payment</div>
                        <div className="text-sm text-muted-foreground">
                          Pay the minimum due each month
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="statement" id="auto-statement" />
                      <Label htmlFor="auto-statement" className="cursor-pointer flex-1">
                        <div>Full Statement Balance</div>
                        <div className="text-sm text-muted-foreground">
                          Pay the full balance (avoid interest)
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Button
                    className="w-full"
                    onClick={() => updateAutopay({ accountId, enabled: true, amountType: autopayType })}
                    disabled={isUpdatingAutopay}
                  >
                    {isUpdatingAutopay ? 'Saving...' : 'Save Autopay Settings'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

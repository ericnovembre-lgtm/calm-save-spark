import { useState } from 'react';
import { DollarSign, Calendar, CreditCard, Zap, Calculator, CheckCircle } from 'lucide-react';
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
import { motion } from 'framer-motion';

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
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Make a Payment</DialogTitle>
          <DialogDescription className="text-base">
            Choose your payment amount and schedule
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="one-time" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="one-time">One-Time Payment</TabsTrigger>
            <TabsTrigger value="autopay">Autopay</TabsTrigger>
          </TabsList>

          <TabsContent value="one-time" className="space-y-5 mt-4">
            <div className="space-y-5">
              <div className="grid gap-3">
                <Label className="text-base font-semibold">Payment Amount</Label>
                <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as any)}>
                  <div className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="minimum" id="minimum" />
                      <Label htmlFor="minimum" className="cursor-pointer">
                        <div className="font-medium">Minimum Payment</div>
                        <div className="text-xs text-muted-foreground">Required monthly amount</div>
                      </Label>
                    </div>
                    <span className="text-lg font-bold">${(minimumPayment / 100).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-green-500/5">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="statement" id="statement" />
                      <Label htmlFor="statement" className="cursor-pointer">
                        <div className="font-medium">Full Balance</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Recommended • Avoid interest</div>
                      </Label>
                    </div>
                    <span className="text-lg font-bold">${(currentBalance / 100).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-1">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="cursor-pointer flex-1">
                        <div className="font-medium">Custom Amount</div>
                        <div className="text-xs text-muted-foreground">Choose your own amount</div>
                      </Label>
                    </div>
                    {paymentType === 'custom' && (
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-32 text-right font-bold text-lg"
                        min={minimumPayment / 100}
                        max={currentBalance / 100}
                        step="0.01"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-date" className="text-sm font-medium">Schedule Payment (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="pl-10 h-11"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {scheduledDate && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Payment scheduled for {new Date(scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </motion.p>
                )}
              </div>

              {paymentType === 'custom' && amount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Payoff Calculator</div>
                      <div className="text-amber-700 dark:text-amber-300">
                        {payoffMonths === Infinity ? (
                          '⚠️ Payment too small to pay off balance (covers interest only)'
                        ) : payoffMonths === 1 ? (
                          '🎉 This payment will pay off your balance!'
                        ) : (
                          `📊 At $${amount.toFixed(2)}/month, you'll be debt-free in ${payoffMonths} months`
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="pt-5 border-t space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <span className="text-base font-medium text-muted-foreground">Payment Total</span>
                  <span className="text-3xl font-bold text-primary">${amount.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isProcessing || amount <= 0 || (paymentType === 'custom' && amount < minimumPayment / 100)}
                >
                  {isProcessing ? 'Processing...' : scheduledDate ? '📅 Schedule Payment' : '💳 Pay Now'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="autopay" className="space-y-5 mt-4">
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Never miss a payment
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    Autopay automatically pays your bill on the due date each month, helping you avoid late fees and maintain a strong credit score
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 border-2 rounded-xl bg-gradient-to-br from-background to-accent/5">
                <div>
                  <div className="font-semibold text-base mb-1">Enable Autopay</div>
                  <div className="text-sm text-muted-foreground">
                    Automatic payments on due date
                  </div>
                </div>
                <Switch
                  checked={autopayEnabled}
                  onCheckedChange={handleAutopayToggle}
                  disabled={isUpdatingAutopay}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              {autopayEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <Label className="text-base font-semibold">Autopay Amount</Label>
                  <RadioGroup value={autopayType} onValueChange={(v) => setAutopayType(v as any)}>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="minimum" id="auto-minimum" />
                      <Label htmlFor="auto-minimum" className="cursor-pointer flex-1">
                        <div className="font-medium mb-1">Minimum Payment</div>
                        <div className="text-xs text-muted-foreground">
                          Pay the minimum due each month
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-green-500/5">
                      <RadioGroupItem value="statement" id="auto-statement" />
                      <Label htmlFor="auto-statement" className="cursor-pointer flex-1">
                        <div className="font-medium mb-1">Full Statement Balance</div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Pay the full balance (avoid interest) • Recommended
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Button
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => updateAutopay({ accountId, enabled: true, amountType: autopayType })}
                    disabled={isUpdatingAutopay}
                  >
                    {isUpdatingAutopay ? 'Saving...' : '✓ Save Autopay Settings'}
                  </Button>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

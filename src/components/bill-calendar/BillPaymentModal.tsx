import { useState } from 'react';
import { Bill } from '@/hooks/useBillCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { CreditCard, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BillPaymentModalProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillPaymentModal({ bill, open, onOpenChange }: BillPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('checking');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  if (!bill) return null;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    toast.success(`Payment of $${amount || bill.amount.toFixed(2)} sent to ${bill.merchant}`);
    
    setTimeout(() => {
      setIsSuccess(false);
      onOpenChange(false);
      setAmount('');
    }, 2000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pay {bill.merchant}
          </DialogTitle>
          <DialogDescription>
            Complete your payment for this bill
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-foreground font-medium">Payment Successful!</p>
            <p className="text-sm text-muted-foreground mt-1">
              ${amount || bill.amount.toFixed(2)} sent to {bill.merchant}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder={bill.amount.toFixed(2)}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Suggested: ${bill.amount.toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account ••••4567</SelectItem>
                    <SelectItem value="savings">Savings Account ••••8901</SelectItem>
                    <SelectItem value="card">Credit Card ••••2345</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${amount || bill.amount.toFixed(2)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

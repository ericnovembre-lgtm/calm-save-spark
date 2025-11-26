import { useState } from 'react';
import { Check, CreditCard, Lock, Zap } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { useCardActivation } from '@/hooks/useCardActivation';

interface CardActivationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  last4Hint: string;
}

export function CardActivationFlow({
  open,
  onOpenChange,
  cardId,
  last4Hint,
}: CardActivationFlowProps) {
  const { activateCard, isActivating } = useCardActivation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    last4: '',
    cvv: '',
    zipCode: '',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    activateCard({
      cardId,
      last4: formData.last4,
      cvv: formData.cvv,
      zipCode: formData.zipCode,
    });
    
    // Close modal on success (handled by the hook's onSuccess)
    setTimeout(() => {
      onOpenChange(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setStep(1);
    setFormData({ last4: '', cvv: '', zipCode: '' });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.last4.length === 4 && /^\d{4}$/.test(formData.last4);
      case 2:
        return formData.cvv.length >= 3 && /^\d{3,4}$/.test(formData.cvv);
      case 3:
        return formData.zipCode.length === 5 && /^\d{5}$/.test(formData.zipCode);
      default:
        return false;
    }
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Activate Your Card</DialogTitle>
          <DialogDescription>
            Verify your card details to start using it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {step} of 3</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-5">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Card Verification</div>
                    <div className="text-muted-foreground">
                      Enter the last 4 digits on your card ending in {last4Hint}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last4">Last 4 Digits</Label>
                  <Input
                    id="last4"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={formData.last4}
                    onChange={(e) => setFormData({ ...formData, last4: e.target.value.replace(/\D/g, '') })}
                    className="text-center text-2xl tracking-widest"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-5">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Lock className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Security Code</div>
                    <div className="text-muted-foreground">
                      Enter the 3-digit CVV on the back of your card
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV Security Code</Label>
                  <Input
                    id="cvv"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="•••"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                    className="text-center text-2xl tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Usually found on the back of your card
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-5">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Zap className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Billing ZIP Code</div>
                    <div className="text-muted-foreground">
                      Enter your billing address ZIP code for final verification
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
                    className="text-center text-2xl tracking-widest"
                    autoFocus
                  />
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-green-900 dark:text-green-100">
                        Almost there!
                      </div>
                      <div className="text-green-700 dark:text-green-300 mt-1">
                        Click "Activate Card" to complete the process
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isActivating}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isActivating}
                className="flex-1"
              >
                {isActivating ? 'Activating...' : 'Activate Card'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhysicalCreditCard } from './PhysicalCreditCard';
import { cn } from '@/lib/utils';

interface CardCustomizationWizardProps {
  onComplete: (data: CustomizationData) => void;
  onCancel: () => void;
}

export interface CustomizationData {
  cardholderName: string;
  variant: 'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver';
}

const finishOptions = [
  {
    id: 'matte-black' as const,
    name: 'Matte Black',
    description: 'Stealthy elegance',
    bg: 'bg-neutral-900',
    isPremium: false,
  },
  {
    id: 'matte-white' as const,
    name: 'Matte White',
    description: 'Clean minimalism',
    bg: 'bg-[#FAFAFA]',
    border: 'border-neutral-300',
    isPremium: false,
  },
  {
    id: 'metallic-gold' as const,
    name: 'Metallic Gold',
    description: 'Luxury statement',
    bg: 'bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728]',
    isPremium: true,
  },
  {
    id: 'metallic-silver' as const,
    name: 'Metallic Silver',
    description: 'Modern prestige',
    bg: 'bg-gradient-to-br from-[#E0E0E0] via-[#FFFFFF] to-[#B0B0B0]',
    isPremium: true,
  },
];

export function CardCustomizationWizard({ onComplete, onCancel }: CardCustomizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cardholderName, setCardholderName] = useState('');
  const [variant, setVariant] = useState<'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver'>('matte-black');
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (currentStep === 0 && !cardholderName.trim()) return;
    if (currentStep === 3) {
      if (agreed) {
        onComplete({ cardholderName, variant });
      }
      return;
    }
    setCurrentStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNameChange = (value: string) => {
    // Uppercase, max 24 chars, alphanumeric + spaces
    const sanitized = value
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .slice(0, 24);
    setCardholderName(sanitized);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground">Customize Your Card</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personalize your $ave+ credit card in 4 simple steps
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 justify-center py-6 px-6">
        {[0, 1, 2, 3].map((step) => (
          <motion.div
            key={step}
            className={cn(
              'h-2 rounded-full transition-all',
              currentStep >= step ? 'bg-primary' : 'bg-muted'
            )}
            animate={{
              width: currentStep === step ? 32 : 8,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Step 1: Enter Your Name</h3>
                <p className="text-sm text-muted-foreground">
                  This name will be embossed on your physical card
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="cardholder-name">Cardholder Name</Label>
                <Input
                  id="cardholder-name"
                  placeholder="JOHN DOE"
                  value={cardholderName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-lg font-mono tracking-wider"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  {cardholderName.length}/24 characters • Uppercase only
                </p>
              </div>

              {/* Mini Preview */}
              {cardholderName && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <div className="font-mono text-sm tracking-widest text-foreground">
                    {cardholderName}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Step 2: Choose Your Finish</h3>
                <p className="text-sm text-muted-foreground">
                  Select the style that matches your personality
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finishOptions.map((finish) => (
                  <motion.button
                    key={finish.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setVariant(finish.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left relative',
                      variant === finish.id
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {finish.isPremium && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    <div className={cn('w-full h-24 rounded-lg mb-3', finish.bg, finish.border)} />
                    <p className="font-semibold text-foreground">{finish.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{finish.description}</p>
                    {variant === finish.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Step 3: Preview Your Card</h3>
                <p className="text-sm text-muted-foreground">
                  Tap the card to flip and see both sides
                </p>
              </div>

              <div className="flex items-center justify-center py-8" style={{ perspective: 1400 }}>
                <PhysicalCreditCard
                  variant={variant}
                  cardHolder={cardholderName || 'YOUR NAME HERE'}
                  cardNumber="4242"
                  expiryDate="12/28"
                  cvv="123"
                  showDetails={true}
                  isFlippable={true}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">Your Selection:</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-mono text-foreground">{cardholderName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Finish:</span>
                  <span className="text-foreground">
                    {finishOptions.find((f) => f.id === variant)?.name}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Step 4: Confirm Your Order</h3>
                <p className="text-sm text-muted-foreground">
                  Review your card design and place your order
                </p>
              </div>

              <div className="flex items-center justify-center py-4">
                <PhysicalCreditCard
                  variant={variant}
                  cardHolder={cardholderName}
                  cardNumber="4242"
                  expiryDate="12/28"
                  showDetails={true}
                  isFlippable={false}
                  className="scale-90"
                />
              </div>

              <div className="bg-muted p-6 rounded-lg space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cardholder Name:</span>
                    <span className="text-sm font-mono font-medium text-foreground">
                      {cardholderName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Card Finish:</span>
                    <span className="text-sm font-medium text-foreground">
                      {finishOptions.find((f) => f.id === variant)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Shipping:</span>
                    <span className="text-sm font-medium text-foreground">Free (5-7 business days)</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="text-sm font-semibold text-foreground">Total:</span>
                    <span className="text-sm font-semibold text-foreground">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the $ave+ Card Terms and Conditions, including the Cardholder Agreement
                  and Privacy Policy. I understand this card will be linked to my existing $ave+ account.
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border p-6 flex justify-between items-center bg-background">
        <Button
          variant="ghost"
          onClick={currentStep === 0 ? onCancel : handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            (currentStep === 0 && !cardholderName.trim()) ||
            (currentStep === 3 && !agreed)
          }
          className="gap-2"
        >
          {currentStep === 3 ? 'Order Your Card' : 'Continue'}
          {currentStep === 3 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

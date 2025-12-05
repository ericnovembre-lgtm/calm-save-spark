import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Store, Tag, Calendar, Mic, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useVoiceTransaction } from '@/hooks/useVoiceTransaction';
import { toast } from 'sonner';

interface QuickTransactionEntryProps {
  onClose: () => void;
}

const categories = [
  { id: 'food', label: 'Food & Dining', emoji: '🍔' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'bills', label: 'Bills', emoji: '📄' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'other', label: 'Other', emoji: '📦' }
];

export function QuickTransactionEntry({ onClose }: QuickTransactionEntryProps) {
  const { addToQueue, isOnline } = useOfflineQueue();
  const { isListening, transcript, parsedTransaction, startListening, stopListening, reset } = useVoiceTransaction();
  
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply parsed voice transaction
  if (parsedTransaction && !amount) {
    setAmount(parsedTransaction.amount.toString());
    setMerchant(parsedTransaction.merchant);
    if (parsedTransaction.category) {
      setSelectedCategory(parsedTransaction.category);
    }
    reset();
  }

  const handleSubmit = async () => {
    if (!amount || !merchant) {
      toast.error('Please enter amount and merchant');
      return;
    }

    setIsSubmitting(true);
    haptics.buttonPress();

    const transactionData = {
      amount: -Math.abs(parseFloat(amount)),
      merchant,
      category: categories.find(c => c.id === selectedCategory)?.label || 'Other',
      transaction_date: new Date().toISOString()
    };

    await addToQueue(transactionData);
    
    haptics.formSuccess();
    toast.success(isOnline ? 'Transaction saved!' : 'Transaction queued for sync');
    
    setIsSubmitting(false);
    onClose();
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
    haptics.buttonPress();
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
    >
      {/* Handle */}
      <div className="sticky top-0 z-10 bg-background pt-3 pb-2">
        <div className="w-12 h-1 rounded-full bg-muted mx-auto" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4">
        <h2 className="text-lg font-semibold">Quick Add</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Voice Input Section */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-4 mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Listening...</p>
              <p className="text-sm text-muted-foreground">
                {transcript || 'Say something like "Spent $50 at Target"'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <div className="px-4 pb-6 space-y-4">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-2xl font-semibold h-14"
              inputMode="decimal"
            />
          </div>
        </div>

        {/* Merchant */}
        <div className="space-y-2">
          <Label htmlFor="merchant">Merchant</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="merchant"
              placeholder="Where did you spend?"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Category
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  haptics.select();
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                  selectedCategory === cat.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-xs truncate w-full text-center">{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date (auto-set to today) */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Today, {new Date().toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceToggle}
            className={cn(
              "h-12 w-12 rounded-full",
              isListening && "bg-primary/10 border-primary text-primary"
            )}
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => toast.info('Receipt scanner coming soon!')}
          >
            <Camera className="h-5 w-5" />
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || !merchant}
            className="flex-1 h-12 rounded-full"
          >
            {isSubmitting ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Save Transaction
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

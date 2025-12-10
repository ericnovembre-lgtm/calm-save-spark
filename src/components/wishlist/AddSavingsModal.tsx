import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddToWishlistSavings, type WishlistItem } from '@/hooks/useWishlist';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WishlistItem;
}

export function AddSavingsModal({ isOpen, onClose, item }: AddSavingsModalProps) {
  const [amount, setAmount] = useState('');
  
  const addSavings = useAddToWishlistSavings();

  const remaining = Number(item.target_amount) - Number(item.saved_amount);
  const quickAmounts = [10, 25, 50, 100].filter(a => a <= remaining + 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    await addSavings.mutateAsync({
      id: item.id,
      amount: parseFloat(amount),
    });

    setAmount('');
    onClose();
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-card rounded-2xl border border-border/50 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Add Savings</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="text-center pb-2">
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${remaining.toFixed(2)} remaining to goal
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount to add</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 text-lg"
                    required
                  />
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleQuickAmount(value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      amount === value.toString()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    ${value}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleQuickAmount(remaining)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    amount === remaining.toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                  }`}
                >
                  Complete Goal
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!amount || parseFloat(amount) <= 0 || addSavings.isPending}
                >
                  {addSavings.isPending ? 'Adding...' : 'Add Savings'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

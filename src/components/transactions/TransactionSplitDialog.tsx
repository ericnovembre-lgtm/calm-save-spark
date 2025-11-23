import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Loader2, Share2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { SplitRow } from './SplitRow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateVenmoLink, generateZellePaymentText, copyToClipboard } from '@/utils/payment-links';

interface Split {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  paymentStatus: 'pending' | 'paid' | 'waived';
  paymentMethod?: string;
}

interface TransactionForSplit {
  id: string;
  merchant: string | null;
  description: string | null;
  amount: number;
  transaction_date: string;
  category: string;
}

interface TransactionSplitDialogProps {
  transaction: TransactionForSplit;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionSplitDialog({
  transaction,
  isOpen,
  onClose,
}: TransactionSplitDialogProps) {
  const { toast } = useToast();
  const [splits, setSplits] = useState<Split[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const amount = Math.abs(typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount));
  const totalAllocated = splits.reduce((sum, s) => sum + s.amount, 0);
  const remaining = amount - totalAllocated;
  const isValid = Math.abs(remaining) < 0.01;

  useEffect(() => {
    if (isOpen) {
      fetchSplitSuggestion();
    }
  }, [isOpen]);

  const fetchSplitSuggestion = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-transaction-split', {
        body: {
          merchant: transaction.merchant,
          amount: amount,
          description: transaction.description,
          category: transaction.category,
        },
      });

      if (error) throw error;

      if (data?.suggestedSplits) {
        setSplits(data.suggestedSplits.map((s: any, i: number) => ({
          id: `split-${i}`,
          name: s.name,
          amount: s.amount,
          percentage: s.percentage,
          paymentStatus: s.name === 'You' ? 'paid' : 'pending',
        })));
        setSplitType(data.suggestedSplitType);
      }
    } catch (error) {
      console.error('Error fetching split suggestion:', error);
      // Fallback to equal split between 2 people
      const half = amount / 2;
      setSplits([
        { id: 'split-0', name: 'You', amount: half, percentage: 50, paymentStatus: 'paid' },
        { id: 'split-1', name: 'Person 2', amount: half, percentage: 50, paymentStatus: 'pending' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSplit = () => {
    const newId = `split-${Date.now()}`;
    if (splitType === 'equal') {
      const count = splits.length + 1;
      const equalAmount = amount / count;
      setSplits([...splits.map(s => ({ ...s, amount: equalAmount, percentage: 100 / count })), {
        id: newId,
        name: `Person ${count}`,
        amount: equalAmount,
        percentage: 100 / count,
        paymentStatus: 'pending',
      }]);
    } else {
      setSplits([...splits, {
        id: newId,
        name: `Person ${splits.length + 1}`,
        amount: 0,
        percentage: 0,
        paymentStatus: 'pending',
      }]);
    }
  };

  const updateSplit = (index: number, updated: Split) => {
    const newSplits = [...splits];
    newSplits[index] = updated;
    
    if (splitType === 'equal') {
      const equalAmount = amount / newSplits.length;
      newSplits.forEach(s => {
        s.amount = equalAmount;
        s.percentage = 100 / newSplits.length;
      });
    }
    
    setSplits(newSplits);
  };

  const removeSplit = (index: number) => {
    const newSplits = splits.filter((_, i) => i !== index);
    
    if (splitType === 'equal' && newSplits.length > 0) {
      const equalAmount = amount / newSplits.length;
      newSplits.forEach(s => {
        s.amount = equalAmount;
        s.percentage = 100 / newSplits.length;
      });
    }
    
    setSplits(newSplits);
  };

  const handleSaveSplits = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('transaction_splits')
        .insert(
          splits.map(split => ({
            parent_transaction_id: transaction.id,
            split_name: split.name,
            split_amount: split.amount,
            split_percentage: split.percentage,
            payment_status: split.paymentStatus,
            payment_method: split.paymentMethod,
            user_id: user.id,
          }))
        );

      if (error) throw error;

      toast({
        title: 'Splits saved',
        description: `Transaction split among ${splits.length} people`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to save splits',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePaymentRequests = () => {
    const pendingSplits = splits.filter(s => s.paymentStatus === 'pending');
    if (pendingSplits.length === 0) {
      toast({ title: 'No pending payments', description: 'All splits are marked as paid or waived' });
      return;
    }

    const message = pendingSplits.map(s => 
      `${s.name}: $${s.amount.toFixed(2)} for ${transaction.merchant}`
    ).join('\n');

    copyToClipboard(message).then(() => {
      toast({
        title: 'Payment request copied',
        description: 'Share this with your group',
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Split Transaction</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{transaction.merchant || 'Unknown Merchant'}</h3>
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={splitType} onValueChange={(v) => setSplitType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal">Equal Split</TabsTrigger>
                <TabsTrigger value="percentage">By Percentage</TabsTrigger>
                <TabsTrigger value="custom">Custom Amounts</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3 mt-4">
              {splits.map((split, idx) => (
                <SplitRow
                  key={split.id}
                  split={split}
                  splitType={splitType}
                  totalAmount={amount}
                  onUpdate={(updated) => updateSplit(idx, updated)}
                  onRemove={() => removeSplit(idx)}
                  canRemove={split.name !== 'You' && splits.length > 2}
                />
              ))}
            </div>

            <Button variant="outline" onClick={addSplit} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Person
            </Button>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Allocated: ${totalAllocated.toFixed(2)}</span>
                <span className={remaining > 0.01 ? 'text-warning' : 'text-success font-medium'}>
                  {remaining > 0.01 ? `Remaining: $${remaining.toFixed(2)}` : <><Check className="w-4 h-4 inline mr-1" />Balanced</>}
                </span>
              </div>
              <Progress 
                value={(totalAllocated / amount) * 100} 
                className="h-2"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleSaveSplits}
                disabled={!isValid || isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Splits'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleGeneratePaymentRequests}
                disabled={!isValid}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

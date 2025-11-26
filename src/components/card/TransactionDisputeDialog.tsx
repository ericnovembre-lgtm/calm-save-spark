import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Download, Send } from 'lucide-react';
import { useTransactionDispute } from '@/hooks/useTransactionDispute';
import type { Database } from '@/integrations/supabase/types';

type CardTransaction = Database['public']['Tables']['card_transactions']['Row'];

interface TransactionDisputeDialogProps {
  transaction: CardTransaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DISPUTE_REASONS = [
  { value: 'unauthorized', label: 'Unauthorized Charge', description: 'I did not authorize this transaction' },
  { value: 'duplicate', label: 'Duplicate Charge', description: 'I was charged multiple times' },
  { value: 'not_received', label: 'Service Not Received', description: 'I did not receive goods or services' },
  { value: 'incorrect_amount', label: 'Incorrect Amount', description: 'The amount charged is wrong' },
  { value: 'quality_issue', label: 'Quality Issue', description: 'Product/service was defective or not as described' },
  { value: 'cancelled', label: 'Cancelled Transaction', description: 'I cancelled but was still charged' },
];

export function TransactionDisputeDialog({ transaction, open, onOpenChange }: TransactionDisputeDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const { submitDispute, generateLetter, isSubmitting, isGenerating, generatedLetter } = useTransactionDispute();

  const handleGenerateLetter = async () => {
    if (!reason) return;
    
    await generateLetter({
      transactionId: transaction.id,
      reason,
      details,
      merchant: transaction.merchant_name || transaction.ai_merchant_name || 'Unknown Merchant',
      amount: transaction.amount_cents / 100,
      date: transaction.transaction_date || new Date().toISOString(),
    });
  };

  const handleSubmit = async () => {
    if (!reason) return;

    await submitDispute({
      transactionId: transaction.id,
      reason,
      details,
      letter: generatedLetter,
    });

    onOpenChange(false);
  };

  const selectedReasonData = DISPUTE_REASONS.find(r => r.value === reason);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispute Transaction</DialogTitle>
          <DialogDescription>
            File a dispute for this transaction. We'll help you generate a professional dispute letter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Details */}
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{transaction.ai_merchant_name || transaction.merchant_name}</span>
              <Badge variant={transaction.amount_cents < 0 ? 'destructive' : 'default'}>
                ${(Math.abs(transaction.amount_cents) / 100).toFixed(2)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Date unknown'}
            </div>
          </div>

          {/* Dispute Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Dispute *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context that will help with your dispute..."
              rows={4}
            />
          </div>

          {/* Generate Letter Button */}
          {!generatedLetter && (
            <Button
              onClick={handleGenerateLetter}
              disabled={!reason || isGenerating}
              className="w-full gap-2"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Letter...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Dispute Letter
                </>
              )}
            </Button>
          )}

          {/* Generated Letter Preview */}
          {generatedLetter && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Generated Dispute Letter</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const blob = new Blob([generatedLetter], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dispute-${transaction.id}.txt`;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-muted border max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">{generatedLetter}</pre>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Clear the letter to regenerate
                    handleGenerateLetter();
                  }}
                  variant="outline"
                  disabled={isGenerating}
                  className="flex-1 gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Regenerate
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Dispute
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            Your dispute will be reviewed and submitted to the merchant. This process typically takes 7-10 business days.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

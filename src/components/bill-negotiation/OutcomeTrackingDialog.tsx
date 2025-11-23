import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OutcomeTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  requestId?: string;
  originalAmount: number;
}

export function OutcomeTrackingDialog({
  open,
  onOpenChange,
  variantId,
  requestId,
  originalAmount,
}: OutcomeTrackingDialogProps) {
  const [outcome, setOutcome] = useState<'success' | 'partial' | 'failed'>('success');
  const [newAmount, setNewAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const wasSuccessful = outcome === 'success' || outcome === 'partial';
      const actualSavings = wasSuccessful && newAmount 
        ? originalAmount - parseFloat(newAmount)
        : 0;

      const { error } = await supabase
        .from('negotiation_script_outcomes')
        .insert({
          script_variant_id: variantId,
          request_id: requestId,
          was_successful: wasSuccessful,
          actual_savings: actualSavings,
          new_monthly_amount: newAmount ? parseFloat(newAmount) : null,
          negotiation_notes: notes,
          user_rating: rating > 0 ? rating : null,
        });

      if (error) throw error;

      toast.success('Thanks for sharing your results!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving outcome:', error);
      toast.error('Failed to save outcome');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            How did your negotiation go?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Outcome</label>
            <Select value={outcome} onValueChange={(v: any) => setOutcome(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="success">✅ Successful - Got a discount</SelectItem>
                <SelectItem value="partial">⚠️ Partial - Some savings</SelectItem>
                <SelectItem value="failed">❌ Unsuccessful - No change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(outcome === 'success' || outcome === 'partial') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Monthly Amount</label>
              <Input
                type="number"
                placeholder="Enter new amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                step="0.01"
              />
              {newAmount && (
                <div className="text-sm text-emerald-400">
                  💰 Savings: ${(originalAmount - parseFloat(newAmount)).toFixed(2)}/mo
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              placeholder="What worked? What didn't?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rate this script</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Skip
            </Button>
            <Button
              className="flex-1 bg-cyan-600 hover:bg-cyan-500"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

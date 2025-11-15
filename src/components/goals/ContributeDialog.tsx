import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { contributionSchema, ContributionFormData } from "@/lib/validations/goal-schemas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  onSuccess: () => void;
}

export const ContributeDialog = ({
  open,
  onOpenChange,
  goalId,
  goalName,
  currentAmount,
  targetAmount,
  onSuccess
}: ContributeDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContributionFormData>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    note: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = targetAmount - currentAmount;

  const handleSubmit = async () => {
    const result = contributionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const newAmount = Math.min(currentAmount + result.data.amount, targetAmount);
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Funds Added! 💰",
        description: `Added $${result.data.amount.toLocaleString()} to ${goalName}`,
      });

      onSuccess();
      onOpenChange(false);
      setFormData({ amount: 0, date: new Date().toISOString().split('T')[0], note: "" });
      setErrors({});
    } catch (error: any) {
      toast({
        title: "Failed to add funds",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds to {goalName}</DialogTitle>
          <DialogDescription>
            ${remaining.toLocaleString()} remaining to reach your goal
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount || ""}
              onChange={(e) => {
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                setErrors({ ...errors, amount: "" });
              }}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Birthday money, bonus, etc."
              value={formData.note}
              onChange={(e) => {
                setFormData({ ...formData, note: e.target.value });
                setErrors({ ...errors, note: "" });
              }}
              className={errors.note ? "border-destructive" : ""}
              rows={3}
            />
            {errors.note && (
              <p className="text-sm text-destructive mt-1">{errors.note}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Adding..." : `Add $${formData.amount || 0}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

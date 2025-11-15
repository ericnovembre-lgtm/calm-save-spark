import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { goalSchema, GoalFormData } from "@/lib/validations/goal-schemas";
import { useToast } from "@/hooks/use-toast";

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    name: string;
    target_amount: number;
    deadline?: string | null;
    icon?: string | null;
  } | null;
  onSubmit: (id: string, data: Partial<GoalFormData>) => void;
  isSubmitting: boolean;
}

export const EditGoalDialog = ({
  open,
  onOpenChange,
  goal,
  onSubmit,
  isSubmitting
}: EditGoalDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    deadline: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        target_amount: String(goal.target_amount),
        deadline: goal.deadline || ""
      });
      setErrors({});
    }
  }, [goal]);

  const handleSubmit = () => {
    if (!goal) return;

    const result = goalSchema.safeParse({
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline || undefined
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      toast({ 
        title: "Please fix the errors below", 
        variant: "destructive" 
      });
      return;
    }

    setErrors({});
    onSubmit(goal.id, {
      name: result.data.name,
      target_amount: result.data.target_amount,
      deadline: result.data.deadline || undefined
    });
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update your goal details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-goal-name">Goal Name *</Label>
            <Input
              id="edit-goal-name"
              placeholder="Emergency Fund"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: "" });
              }}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="edit-target-amount">Target Amount ($) *</Label>
            <Input
              id="edit-target-amount"
              type="number"
              placeholder="5000"
              value={formData.target_amount}
              onChange={(e) => {
                setFormData({ ...formData, target_amount: e.target.value });
                setErrors({ ...errors, target_amount: "" });
              }}
              className={errors.target_amount ? "border-destructive" : ""}
            />
            {errors.target_amount && (
              <p className="text-sm text-destructive mt-1">{errors.target_amount}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
            <Input
              id="edit-deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => {
                setFormData({ ...formData, deadline: e.target.value });
                setErrors({ ...errors, deadline: "" });
              }}
              className={errors.deadline ? "border-destructive" : ""}
            />
            {errors.deadline && (
              <p className="text-sm text-destructive mt-1">{errors.deadline}</p>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

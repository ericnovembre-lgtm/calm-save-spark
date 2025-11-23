import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { POT_GRADIENTS, GradientKey, getGradientStyle } from "@/lib/pot-gradients";

interface Pot {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number | null;
  target_date: string | null;
  notes: string | null;
  color: GradientKey | string;
  image_url?: string | null;
}

interface EditPotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pot: Pot | null;
}

export const EditPotDialog = ({ open, onOpenChange, pot }: EditPotDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: pot?.name || "",
    target_amount: pot?.target_amount?.toString() || "",
    notes: pot?.notes || "",
    image_url: pot?.image_url || "",
    color: pot?.color || "cyber-grape"
  });

  const updatePotMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!pot) throw new Error("No pot selected");

      const { error } = await supabase
        .from('pots')
        .update({
          name: data.name,
          target_amount: data.target_amount ? parseFloat(data.target_amount) : null,
          notes: data.notes || null,
          image_url: data.image_url || null,
          color: data.color,
        })
        .eq('id', pot.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      toast({
        title: "Pot updated successfully!",
        description: "Your savings pot has been updated.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update pot",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your pot",
        variant: "destructive"
      });
      return;
    }

    updatePotMutation.mutate(formData);
  };

  // Update form data when pot changes
  if (pot && open && formData.name === "") {
    setFormData({
      name: pot.name,
      target_amount: pot.target_amount?.toString() || "",
      notes: pot.notes || "",
      image_url: pot.image_url || "",
      color: pot.color
    });
  }

  const PRESET_GRADIENTS: GradientKey[] = ["cyber-grape", "neon-sunset", "ocean-depth", "emerald-dream", "fire-opal"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Savings Pot</DialogTitle>
          <DialogDescription>
            Update your savings pot details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Vacation Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-target">Target Amount</Label>
            <Input
              id="edit-target"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 5000"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea
              id="edit-notes"
              placeholder="What are you saving for?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">Image URL (optional)</Label>
            <Input
              id="edit-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_GRADIENTS.map((gradientKey) => (
                <button
                  key={gradientKey}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: gradientKey })}
                  className={`h-12 rounded-lg transition-all ${
                    formData.color === gradientKey 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{ background: getGradientStyle(gradientKey) }}
                  aria-label={`Select ${gradientKey} gradient`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={updatePotMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updatePotMutation.isPending}
            >
              {updatePotMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Pot"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

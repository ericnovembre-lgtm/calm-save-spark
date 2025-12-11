import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { UnsplashImagePicker } from "@/components/ui/UnsplashImagePicker";

const PRESET_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

interface CreatePotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePotDialog({ open, onOpenChange }: CreatePotDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    notes: "",
    image_url: "",
    gradient: PRESET_GRADIENTS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your pot",
        variant: "destructive",
      });
      return;
    }

    const targetAmount = parseFloat(formData.target_amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Invalid target amount",
        description: "Please enter a valid target amount greater than $0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("pots").insert({
        user_id: user.id,
        name: formData.name.trim(),
        target_amount: targetAmount,
        current_amount: 0,
        notes: formData.notes.trim() || null,
        image_url: formData.image_url.trim() || null,
        color: formData.gradient,
        is_active: true,
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["pots"] });

      toast({
        title: "Vault created!",
        description: `${formData.name} is ready to fill`,
      });

      // Reset form and close
      setFormData({
        name: "",
        target_amount: "",
        notes: "",
        image_url: "",
        gradient: PRESET_GRADIENTS[0],
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to create pot",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Create Manual Vault</DialogTitle>
          <DialogDescription>
            Set precise targets and customize your savings pot
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Pot Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Emergency Fund, Vacation Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-glass-subtle"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Amount ($) *</Label>
            <Input
              id="target"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g., 5000"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="bg-glass-subtle"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Why are you saving for this?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-glass-subtle min-h-[60px]"
            />
          </div>

          <UnsplashImagePicker
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            defaultQuery={formData.name}
          />

          <div className="space-y-2">
            <Label>Color Gradient</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_GRADIENTS.map((gradient, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, gradient })}
                  className={`h-12 rounded-lg transition-all ${
                    formData.gradient === gradient
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ background: gradient }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Vault"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

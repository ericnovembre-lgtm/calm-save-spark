import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Minus } from "lucide-react";
import confetti from "canvas-confetti";
import { haptics } from "@/lib/haptics";

interface Pot {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number | null;
}

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pot: Pot | null;
}

export const AddFundsDialog = ({ open, onOpenChange, pot }: AddFundsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  const updateFundsMutation = useMutation({
    mutationFn: async () => {
      if (!pot || !amount) throw new Error("Missing data");

      const numAmount = parseFloat(amount);
      const newAmount = operation === "add" 
        ? pot.current_amount + numAmount 
        : Math.max(0, pot.current_amount - numAmount);

      const { error } = await supabase
        .from('pots')
        .update({ current_amount: newAmount })
        .eq('id', pot.id);

      if (error) throw error;

      return { 
        newAmount, 
        isComplete: pot.target_amount && newAmount >= pot.target_amount 
      };
    },
    onSuccess: ({ newAmount, isComplete }) => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      
      if (isComplete) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#d6c8a2']
        });
        haptics.achievementUnlocked();
        toast({
          title: "🎉 Goal Completed!",
          description: "Congratulations! You reached your target!",
        });
      } else {
        haptics.buttonPress();
        toast({
          title: operation === "add" ? "Funds added!" : "Funds removed",
          description: `New balance: $${newAmount.toFixed(2)}`,
        });
      }
      
      onOpenChange(false);
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update funds",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    updateFundsMutation.mutate();
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{operation === "add" ? "Add" : "Remove"} Funds</DialogTitle>
          <DialogDescription>
            {operation === "add" ? "Add money to" : "Remove money from"} {pot?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Operation Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={operation === "add" ? "default" : "outline"}
              onClick={() => setOperation("add")}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
            <Button
              type="button"
              variant={operation === "subtract" ? "default" : "outline"}
              onClick={() => setOperation("subtract")}
              className="flex-1"
            >
              <Minus className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>

          {/* Current Balance */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold text-foreground">
              ${pot?.current_amount.toFixed(2)}
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Quick amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-xs"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setAmount("");
              }}
              className="flex-1"
              disabled={updateFundsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateFundsMutation.isPending}
            >
              {updateFundsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `${operation === "add" ? "Add" : "Remove"} Funds`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

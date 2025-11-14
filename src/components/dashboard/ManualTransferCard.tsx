import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedButton } from "@/components/ui/animated-button";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { CelebrationManager } from "@/components/effects/CelebrationManager";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const transferSchema = z.object({
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  potId: z.string().min(1, { message: "Please select a goal" }),
});

export const ManualTransferCard = () => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPotId, setSelectedPotId] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  const { data: pots, isLoading } = useQuery({
    queryKey: ['pots-for-transfer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pots')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const transferMutation = useMutation({
    mutationFn: async ({ potId, amount }: { potId: string; amount: number }) => {
      const pot = pots?.find(p => p.id === potId);
      if (!pot) throw new Error("Goal not found");

      const newAmount = parseFloat(String(pot.current_amount || 0)) + amount;

      const { error } = await supabase
        .from('pots')
        .update({ current_amount: newAmount })
        .eq('id', potId);

      if (error) throw error;

      // Log transfer in history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('transfer_history').insert({
          user_id: user.id,
          pot_id: potId,
          amount,
          transfer_type: 'manual',
          status: 'completed',
        });

        // Trigger achievement check
        try {
          const { data: achievementData } = await supabase.functions.invoke('check-achievements', {
            body: {
              userId: user.id,
              eventType: 'transfer_completed',
              eventData: { amount, potId, type: 'manual' }
            }
          });

          // Show achievement toasts if any were unlocked
          if (achievementData?.newAchievements && achievementData.newAchievements.length > 0) {
            const { showAchievementToast } = await import('@/hooks/useAchievementToasts');
            achievementData.newAchievements.forEach((achievement: any) => {
              showAchievementToast(achievement);
            });
          }
        } catch (error) {
          console.error('Failed to check achievements:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots-for-transfer'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-goals'] });
      
      // Trigger celebration
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      toast.success("Transfer successful!", {
        description: `$${amount} added to your goal`,
      });
      setOpen(false);
      setAmount("");
      setSelectedPotId("");
    },
    onError: (error) => {
      toast.error("Transfer failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = transferSchema.safeParse({
      amount: parseFloat(amount),
      potId: selectedPotId,
    });

    if (!validation.success) {
      toast.error("Invalid input", {
        description: validation.error.errors[0].message,
      });
      return;
    }

    transferMutation.mutate({
      potId: selectedPotId,
      amount: parseFloat(amount),
    });
  };

  return (
    <InteractiveCard 
      id="manual-transfer"
      className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
      hapticOnPress={false}
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Transfer to Savings
            </h3>
            <p className="text-xs text-muted-foreground">
              Move money to your goals anytime
            </p>
          </div>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <AnimatedButton className="w-full h-12 text-base font-semibold gap-2">
              Transfer Now
              <ArrowRight className="w-4 h-4" />
            </AnimatedButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                Transfer to Savings
              </DialogTitle>
              <DialogDescription>
                Add money to one of your savings goals
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Transfer Amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal" className="text-sm font-medium">
                  To Goal
                </Label>
                <Select value={selectedPotId} onValueChange={setSelectedPotId} required>
                  <SelectTrigger id="goal" className="h-12">
                    <SelectValue placeholder="Choose a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>Loading goals...</SelectItem>
                    ) : pots && pots.length > 0 ? (
                      pots.map((pot) => {
                        const progress = (parseFloat(String(pot.current_amount || 0)) / parseFloat(String(pot.target_amount))) * 100;
                        return (
                          <SelectItem key={pot.id} value={pot.id}>
                            {pot.name} (${parseFloat(String(pot.current_amount || 0)).toLocaleString()} / ${parseFloat(String(pot.target_amount)).toLocaleString()} - {Math.round(progress)}%)
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="none" disabled>No goals available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <AnimatedButton
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="flex-1 h-11"
                >
                  {transferMutation.isPending ? "Processing..." : "Confirm Transfer"}
                </AnimatedButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
      
      <CelebrationManager trigger={showCelebration} onComplete={() => setShowCelebration(false)} />
    </InteractiveCard>
  );
};

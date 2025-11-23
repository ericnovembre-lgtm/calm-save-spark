import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, X, Repeat, Sparkles } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/empty-state";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";
import { PotsGlassCard } from "@/components/pots/PotsGlassCard";
import { ImpulseSaveCoin } from "@/components/pots/ImpulseSaveCoin";
import { usePotGenerator } from "@/hooks/usePotGenerator";
import { useSavingsPace } from "@/hooks/useSavingsPace";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const Pots = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [dreamInput, setDreamInput] = useState("");
  const { generatePot, isGenerating } = usePotGenerator();

  const { data: pots, isLoading } = useQuery({
    queryKey: ['pots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pots')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deletePotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      toast({ title: "Pot deleted successfully!" });
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast({ 
        title: "Failed to delete pot", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleDelete = (potId: string) => {
    deletePotMutation.mutate(potId);
  };

  const handleDreamKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await generatePot(dreamInput);
      setDreamInput("");
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <motion.div 
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={prefersReducedMotion ? {} : fadeInUp}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Visual Vaults</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Watch your dreams materialize as your savings grow</p>
          </div>
        </motion.div>

        {/* Dream Generator - Hero Input */}
        <motion.div 
          className="relative"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Textarea
              placeholder="What are you dreaming of? 💭 (e.g., A vintage Vespa, Trip to Japan, New MacBook)"
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              onKeyDown={handleDreamKeyDown}
              className="text-lg sm:text-2xl font-light resize-none min-h-[80px] bg-glass-subtle border-2 border-primary/30 focus:border-primary transition-all"
              disabled={isGenerating}
            />
            {isGenerating && (
              <motion.div 
                className="absolute inset-0 bg-background/80 backdrop-blur flex items-center justify-center rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-foreground">Generating your vault...</span>
              </motion.div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to create • AI will suggest a target amount and find a perfect image
          </p>
        </motion.div>

        {/* Automation Card */}
        {pots && pots.length > 0 && (
          <motion.div variants={prefersReducedMotion ? {} : fadeInUp}>
            <Card className="p-6 border border-primary/20 bg-glass">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Repeat className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Fill Vaults Automatically</h3>
                    <p className="text-sm text-muted-foreground">
                      Set recurring deposits to grow your savings pots
                    </p>
                  </div>
                </div>
                <Button onClick={() => window.location.href = '/automations'} variant="outline">
                  Automate Savings
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {isLoading ? (
          <motion.div 
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            variants={prefersReducedMotion ? {} : fadeInUp}
            className="text-center py-12 text-muted-foreground"
          >
            Loading vaults...
          </motion.div>
        ) : pots && pots.length > 0 ? (
          <motion.div 
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            variants={prefersReducedMotion ? {} : staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {pots.map((pot) => {
              const { monthlyPace, projectedDate } = useSavingsPace(pot);
              
              return (
                <PotsGlassCard
                  key={pot.id}
                  pot={pot}
                  onEdit={(pot) => {
                    toast({ title: "Edit modal coming soon!" });
                  }}
                  onDelete={(pot) => setDeleteConfirm(pot)}
                  monthlyPace={monthlyPace}
                  projectedDate={projectedDate}
                />
              );
            })}
          </motion.div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No savings pots yet"
            description="Type your dream above to create your first visual vault with AI"
          />
        )}

        {/* Impulse Save Coin */}
        {pots && pots.length > 0 && (
          <ImpulseSaveCoin pots={pots} />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Pots;

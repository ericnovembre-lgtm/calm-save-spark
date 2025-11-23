import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Repeat, Sparkles, Archive, ArchiveRestore, HelpCircle } from "lucide-react";
import Joyride from 'react-joyride';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";
import { PotsGlassCard } from "@/components/pots/PotsGlassCard";
import { ImpulseSaveCoin } from "@/components/pots/ImpulseSaveCoin";
import { CreatePotDialog } from "@/components/pots/CreatePotDialog";
import { EditPotDialog } from "@/components/pots/EditPotDialog";
import { AddFundsDialog } from "@/components/pots/AddFundsDialog";
import { PotsStats } from "@/components/pots/PotsStats";
import { PotsSkeletonCard } from "@/components/pots/PotsSkeletonCard";
import { EnhancedEmptyState } from "@/components/pots/EnhancedEmptyState";
import { usePotGenerator } from "@/hooks/usePotGenerator";
import { useSavingsPace } from "@/hooks/useSavingsPace";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { usePotsTour } from "@/hooks/usePotsTour";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Pots = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [editPot, setEditPot] = useState<any>(null);
  const [addFundsPot, setAddFundsPot] = useState<any>(null);
  const [dreamInput, setDreamInput] = useState("");
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { generatePot, isGenerating } = usePotGenerator();
  const rotatingPlaceholder = useRotatingPlaceholder(3500);
  const { run, steps, stepIndex, handleJoyrideCallback, resetTour } = usePotsTour();

  const { data: pots, isLoading } = useQuery({
    queryKey: ['pots', showArchived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pots')
        .select('*')
        .eq('is_active', !showArchived)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const archivePotMutation = useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase
        .from('pots')
        .update({ is_active: !archive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      toast({ 
        title: variables.archive ? "Vault archived!" : "Vault restored!",
        description: variables.archive 
          ? "Your vault has been moved to the archive." 
          : "Your vault is now active again."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update vault", 
        description: error.message,
        variant: "destructive" 
      });
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
      await handleGenerate();
    }
  };

  const handleGenerate = async (customDream?: string) => {
    const dream = customDream || dreamInput.trim();
    if (!dream) return;
    await generatePot(dream);
    setDreamInput("");
  };

  const handleArchive = (potId: string) => {
    archivePotMutation.mutate({ id: potId, archive: true });
  };

  const handleRestore = (potId: string) => {
    archivePotMutation.mutate({ id: potId, archive: false });
  };

  const activePots = pots?.filter(p => !showArchived) || [];
  const archivedPots = pots?.filter(p => showArchived) || [];

  return (
    <AppLayout>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            zIndex: 10000,
          },
        }}
      />
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <motion.div 
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={prefersReducedMotion ? {} : fadeInUp}
          className="flex items-center justify-between gap-3 flex-wrap"
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">Visual Vaults</h1>
            <p className="hidden sm:block text-sm text-muted-foreground">Watch your dreams materialize</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="ghost"
              size="icon"
              onClick={resetTour}
              className="h-9 w-9"
              aria-label="Show tour"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => setShowManualDialog(true)}
              size="default"
              className="gap-2"
              data-tour="manual-button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Manual</span>
            </Button>
          </div>
        </motion.div>

        {/* Dream Generator - Hero Input */}
        <motion.div 
          className="relative"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-tour="dream-generator"
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 relative">
              <Textarea
                placeholder={`What are you dreaming of? 💭 ${rotatingPlaceholder}`}
                value={dreamInput}
                onChange={(e) => setDreamInput(e.target.value)}
                onKeyDown={handleDreamKeyDown}
                className="text-base sm:text-lg md:text-xl font-light resize-none min-h-[80px] sm:min-h-[80px] bg-glass-subtle border-2 border-primary/30 focus:border-primary transition-all"
                disabled={isGenerating}
              />
              {isGenerating && (
                <motion.div 
                  className="absolute inset-0 bg-background/80 backdrop-blur flex items-center justify-center rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary mr-2" />
                  <span className="text-xs sm:text-sm text-foreground">Generating vault...</span>
                </motion.div>
              )}
            </div>
            <Button
              onClick={() => handleGenerate()}
              disabled={!dreamInput.trim() || isGenerating}
              size="lg"
              className="h-12 sm:h-[80px] gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Generate</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 hidden sm:block">
            Press Enter or click Generate • AI suggests amount & finds image
          </p>
        </motion.div>

        {/* Archive Toggle */}
        {pots && pots.length > 0 && (
          <div className="flex items-center gap-3 justify-end">
            <Label htmlFor="show-archived" className="text-sm text-muted-foreground cursor-pointer">
              {showArchived ? 'Viewing Archived' : 'Show Archived'}
            </Label>
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
          </div>
        )}

        {/* Stats Overview */}
        {pots && pots.length > 0 && !showArchived && (
          <PotsStats pots={pots} />
        )}

        {/* Automation Card */}
        {pots && pots.length > 0 && !showArchived && (
          <motion.div variants={prefersReducedMotion ? {} : fadeInUp} data-tour="automation-card">
            <Card className="p-4 sm:p-6 border border-primary/20 bg-glass">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 shrink-0">
                    <Repeat className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">Auto-Fill Vaults</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Recurring deposits
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = '/automations'} 
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Set Up
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {isLoading ? (
          <motion.div 
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            variants={prefersReducedMotion ? {} : staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {[1, 2, 3].map((i) => (
              <PotsSkeletonCard key={i} />
            ))}
          </motion.div>
        ) : pots && pots.length > 0 ? (
          <motion.div 
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            variants={prefersReducedMotion ? {} : staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {pots.map((pot, index) => {
              const { monthlyPace, projectedDate } = useSavingsPace(pot);
              
              return (
                <PotsGlassCard
                  key={pot.id}
                  pot={pot}
                  onEdit={(pot) => setEditPot(pot)}
                  onDelete={(pot) => setDeleteConfirm(pot)}
                  onAddFunds={(pot) => setAddFundsPot(pot)}
                  onArchive={showArchived ? handleRestore : handleArchive}
                  monthlyPace={monthlyPace}
                  projectedDate={projectedDate}
                  isArchived={showArchived}
                  dataTour={index === 0 ? "pot-card" : undefined}
                />
              );
            })}
          </motion.div>
        ) : (
          <EnhancedEmptyState onQuickCreate={(dream) => handleGenerate(dream)} />
        )}

        {/* Impulse Save Coin */}
        {pots && pots.length > 0 && (
          <ImpulseSaveCoin pots={pots} />
        )}

        {/* Manual Creation Dialog */}
        <CreatePotDialog 
          open={showManualDialog} 
          onOpenChange={setShowManualDialog}
        />

        {/* Edit Dialog */}
        <EditPotDialog
          open={!!editPot}
          onOpenChange={(open) => !open && setEditPot(null)}
          pot={editPot}
        />

        {/* Add Funds Dialog */}
        <AddFundsDialog
          open={!!addFundsPot}
          onOpenChange={(open) => !open && setAddFundsPot(null)}
          pot={addFundsPot}
        />

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

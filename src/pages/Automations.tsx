import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Timer, CalendarCheck, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutomations } from "@/hooks/useAutomations";
import { AutomationCard } from "@/components/automations/AutomationCard";
import { AutomationFormModal } from "@/components/automations/AutomationFormModal";
import { RoundUpsCard } from "@/components/automations/RoundUpsCard";
import { SafetyRulesCard } from "@/components/automations/SafetyRulesCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MoneyFlowGraph } from "@/components/automations/MoneyFlowGraph";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingState } from "@/components/LoadingState";
import "@/styles/automation-circuit-theme.css";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Automations() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [roundUpsEnabled, setRoundUpsEnabled] = useState(true);
  const [safetyMinBalance, setSafetyMinBalance] = useState(200);

  const {
    scheduledAutomations,
    activeCount,
    estimatedMonthlyTotal,
    isLoading,
    create,
    update,
    toggle,
  } = useAutomations();

  // Track page view
  useEffect(() => {
    trackEvent('page_view', { page: 'automations' });
  }, []);

  // Fetch user settings for round-ups and safety rules
  const { data: userSettings } = useQuery({
    queryKey: ['automation-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('automation_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  useEffect(() => {
    if (userSettings) {
      setRoundUpsEnabled(userSettings.round_up_enabled ?? true);
      // Safety rules would come from a separate settings table or metadata
      setSafetyMinBalance(200); // Default value
    }
  }, [userSettings]);

  const handleOpenModal = (automation?: any) => {
    setEditingAutomation(automation || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAutomation(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (data.id) {
        await update(data);
      } else {
        await create(data);
      }
      handleCloseModal();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to save automation:', error);
    }
  };

  const handleDelete = async (automation: any) => {
    setDeleteConfirm(automation);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation deleted successfully!');
      trackEvent('automation_deleted', { name: deleteConfirm.rule_name });
    } catch (error) {
      toast.error('Failed to delete automation');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleRoundUps = async (enabled: boolean) => {
    setRoundUpsEnabled(enabled);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('automation_settings')
        .upsert({
          user_id: user.id,
          round_up_enabled: enabled,
        });

      if (error) throw error;

      toast.success(enabled ? 'Round-ups enabled' : 'Round-ups disabled');
      trackEvent('round_ups_toggled', { enabled });
    } catch (error) {
      setRoundUpsEnabled(!enabled); // Revert on error
      toast.error('Failed to update round-ups setting');
    }
  };

  const handleUpdateSafetyRule = async (minBalance: number) => {
    setSafetyMinBalance(minBalance);
    toast.success('Safety rule updated');
    trackEvent('safety_rule_updated', { min_balance: minBalance });
    // In production, this would save to database
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Automations</h1>
                  <p className="text-muted-foreground mt-1">
                    Put your savings on autopilot
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleOpenModal()}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                New Automation
              </Button>
            </div>

            {/* Stats */}
            {scheduledAutomations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Active Automations</p>
                  <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Scheduled This Month</p>
                  <p className="text-2xl font-bold text-foreground">
                    {scheduledAutomations.filter(a => a.is_active).length}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Est. Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${estimatedMonthlyTotal.toFixed(0)}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Money Flow Visualizer */}
        {scheduledAutomations.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Money Flow Circuit</CardTitle>
                    <CardDescription>
                      Visualize how your automations route funds
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MoneyFlowGraph 
                  automations={scheduledAutomations.map(auto => ({
                    id: auto.id,
                    rule_name: auto.rule_name,
                    is_active: auto.is_active,
                    action_config: auto.action_config as { amount?: number },
                  }))} 
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Round-ups Card */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <RoundUpsCard
            enabled={roundUpsEnabled}
            onToggle={handleToggleRoundUps}
          />
        </motion.div>

        {/* Scheduled Deposits */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Scheduled Deposits</CardTitle>
                  <CardDescription>
                    Recurring transfers to your savings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {scheduledAutomations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Timer className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No automations yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Create your first automation to start saving automatically
                  </p>
                  <Button onClick={() => handleOpenModal()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Automation
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-3"
                >
                  <AnimatePresence mode="popLayout">
                    {scheduledAutomations.map((automation) => (
                      <motion.div
                        key={automation.id}
                        variants={fadeInUp}
                        layout
                      >
                        <AutomationCard
                          automation={{
                            id: automation.id,
                            rule_name: automation.rule_name,
                            frequency: automation.frequency || 'weekly',
                            start_date: automation.start_date || new Date().toISOString().split('T')[0],
                            next_run_date: automation.next_run_date,
                            is_active: automation.is_active,
                            action_config: automation.action_config as any,
                            notes: automation.notes,
                          }}
                          onEdit={handleOpenModal}
                          onDelete={handleDelete}
                          onToggle={(id, isActive) => toggle({ id, isActive })}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Safety Rules */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <SafetyRulesCard
            minBalance={safetyMinBalance}
            onUpdate={handleUpdateSafetyRule}
          />
        </motion.div>

        {/* Help Card */}
        {scheduledAutomations.length === 0 && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    💡 How Automations Work
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Set up recurring transfers to save automatically</li>
                    <li>• Choose weekly, bi-weekly, or monthly schedules</li>
                    <li>• Round-ups automatically save spare change</li>
                    <li>• Safety rules protect your account balance</li>
                    <li>• Pause or edit automations anytime</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AutomationFormModal
        open={showModal}
        mode={editingAutomation ? 'edit' : 'create'}
        initialData={editingAutomation}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Automation?"
        message={`Are you sure you want to delete "${deleteConfirm?.rule_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        destructive
      />
    </AppLayout>
  );
}

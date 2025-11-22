import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Zap, Loader2 } from "lucide-react";
import { useAutomations } from "@/hooks/useAutomations";
import { AutomationCard } from "@/components/automations/AutomationCard";
import { AutomationFormModal } from "@/components/automations/AutomationFormModal";
import { MoneyFlowGraph } from "@/components/automations/MoneyFlowGraph";
import { ConversationalRuleBuilder } from "@/components/automations/ConversationalRuleBuilder";
import { trackEvent } from "@/lib/analytics";
import { useQueryClient } from "@tanstack/react-query";
import "@/styles/automation-circuit-theme.css";

export default function Automations() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  
  const {
    automations,
    isLoading,
    scheduledAutomations,
    transactionMatchAutomations,
    balanceThresholdAutomations,
    activeCount,
    estimatedMonthlyTotal,
    create,
    toggle,
  } = useAutomations();

  useEffect(() => {
    trackEvent('page_view', { page: 'automations' });
  }, []);

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
      await create(data);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create automation:', error);
    }
  };

  const handleToggleAutomation = async (id: string, isActive: boolean) => {
    await toggle({ id, isActive });
  };

  const handleDeleteAutomation = async (automation: any) => {
    // Deletion logic handled in AutomationCard
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6 circuit-board-container">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 glow-text">Automation Center</h1>
              <p className="text-muted-foreground">
                Describe your rule in plain English or use the manual builder
              </p>
            </div>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4" />
              Manual Builder
            </Button>
          </div>

          <ConversationalRuleBuilder 
            onRuleCreated={() => queryClient.invalidateQueries({ queryKey: ['automations'] })} 
          />
        </div>

        {automations && automations.length > 0 && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Rules</p>
                <p className="text-3xl font-bold">{activeCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Scheduled This Month</p>
                <p className="text-3xl font-bold">
                  {scheduledAutomations.filter(a => a.is_active).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Est. Monthly Savings</p>
                <p className="text-3xl font-bold text-primary">
                  ${estimatedMonthlyTotal.toFixed(0)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {automations && automations.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Money Flow Circuit</h2>
            <MoneyFlowGraph 
              automations={automations.map(auto => ({
                id: auto.id,
                rule_name: auto.rule_name,
                is_active: auto.is_active,
                action_config: auto.action_config as { amount?: number },
              }))} 
            />
          </Card>
        )}

        {transactionMatchAutomations && transactionMatchAutomations.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Smart Rules
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {transactionMatchAutomations.map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={{
                  id: automation.id,
                  rule_name: automation.rule_name,
                  frequency: automation.frequency || 'manual',
                  start_date: automation.start_date || new Date().toISOString().split('T')[0],
                  next_run_date: automation.next_run_date,
                  is_active: automation.is_active,
                  action_config: automation.action_config as any,
                  notes: automation.notes,
                }}
                onEdit={handleOpenModal}
                onDelete={handleDeleteAutomation}
                onToggle={handleToggleAutomation}
              />
            ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : scheduledAutomations && scheduledAutomations.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Scheduled Transfers</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scheduledAutomations.map((automation) => (
              <AutomationCard
                key={automation.id}
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
                onDelete={handleDeleteAutomation}
                onToggle={handleToggleAutomation}
              />
            ))}
            </div>
          </section>
        ) : !transactionMatchAutomations?.length ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Describe your first automation rule above or use the manual builder
            </p>
          </Card>
        ) : null}
      </div>

      <AutomationFormModal
        open={showModal}
        mode={editingAutomation ? 'edit' : 'create'}
        initialData={editingAutomation}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </AppLayout>
  );
}

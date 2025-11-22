import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wrench, Zap, Loader2, Blocks } from "lucide-react";
import { useAutomations } from "@/hooks/useAutomations";
import { AutomationCard } from "@/components/automations/AutomationCard";
import { AutomationFormModal } from "@/components/automations/AutomationFormModal";
import { MoneyFlowGraph } from "@/components/automations/MoneyFlowGraph";
import { ConversationalRuleBuilder } from "@/components/automations/ConversationalRuleBuilder";
import { SmartRecipes } from "@/components/automations/SmartRecipes";
import { EmergencyBrake } from "@/components/automations/EmergencyBrake";
import { AutomationActivityFeed } from "@/components/automations/AutomationActivityFeed";
import { LogicBlockBuilder } from "@/components/automations/logic-builder/LogicBlockBuilder";
import { LogicBlockBuilderMobile } from "@/components/automations/logic-builder/LogicBlockBuilderMobile";
import { AutomationAnalyticsDashboard } from "@/components/automations/AutomationAnalyticsDashboard";
import { KeyboardShortcutsHelp } from "@/components/automations/KeyboardShortcutsHelp";
import { useAutomationKeyboardShortcuts } from "@/hooks/useAutomationKeyboardShortcuts";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import "@/styles/automation-circuit-theme.css";

export default function Automations() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [showLogicBuilder, setShowLogicBuilder] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const conversationalInputRef = useRef<HTMLTextAreaElement>(null);
  const recipesRef = useRef<HTMLDivElement>(null);
  
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

  const { shortcuts } = useAutomationKeyboardShortcuts({
    onNewRule: () => conversationalInputRef.current?.focus(),
    onToggleEmergencyBrake: () => {}, // Handled in EmergencyBrake component
    onOpenRecipes: () => recipesRef.current?.scrollIntoView({ behavior: 'smooth' }),
    onOpenLogicBuilder: () => setShowLogicBuilder(true),
    onShowShortcuts: () => setShowShortcutsHelp(true),
    conversationalInputRef,
  });

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
      <div className={cn(
        "container mx-auto space-y-8 max-w-7xl circuit-board-container min-h-screen",
        isMobile ? "p-4 space-y-6" : "p-6"
      )}>
        {/* Emergency Brake */}
        <EmergencyBrake />

        {/* Header with conversational input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 glow-text">Smart Automations</h1>
              <p className="text-muted-foreground">
                Describe what you want to automate in plain English
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => handleOpenModal()}
            >
              <Wrench className="w-4 h-4 mr-2" />
              Manual Builder
            </Button>
          </div>
          
          <ConversationalRuleBuilder 
            onRuleCreated={() => queryClient.invalidateQueries({ queryKey: ['automations'] })} 
          />
        </div>

        {/* Smart Recipes */}
        <div ref={recipesRef}>
          <SmartRecipes />
        </div>

        {/* Analytics Dashboard */}
        <AutomationAnalyticsDashboard />

        {/* Advanced Logic Builder */}
        <Card className="glass-panel-subtle p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <Blocks className="w-5 h-5 text-primary" />
                Advanced Logic Builder
              </h3>
              <p className="text-sm text-muted-foreground">
                Build complex multi-condition automation rules visually with drag-and-drop blocks
              </p>
            </div>
            <Button
              onClick={() => setShowLogicBuilder(true)}
              variant="outline"
              className="gap-2"
            >
              <Blocks className="w-4 h-4" />
              Open Builder
            </Button>
          </div>
        </Card>

        {/* Stats */}
        {automations && automations.length > 0 && (
          <Card className="glass-panel p-6">
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

        {/* Money Flow Visualizer */}
        {automations && automations.length > 0 && (
          <Card className="glass-panel p-6">
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

        {/* Two Column Layout (Single Column on Mobile) */}
        <div className={cn(
          isMobile ? "space-y-6" : "grid md:grid-cols-3 gap-6"
        )}>
          {/* Left: Automations */}
          <div className="md:col-span-2 space-y-6">
            {/* Smart Rules Section */}
            {transactionMatchAutomations.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Smart Rules
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
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

            {/* Scheduled Transfers Section */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : scheduledAutomations.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Scheduled Transfers</h2>
                <div className="grid gap-4 lg:grid-cols-2">
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
              <Card className="glass-panel p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Describe your first automation rule above or activate a smart recipe
                </p>
              </Card>
            ) : null}
          </div>

          {/* Right: Activity Feed */}
          <div className="md:col-span-1">
            <AutomationActivityFeed />
          </div>
        </div>
      </div>

      <AutomationFormModal
        open={showModal}
        mode={editingAutomation ? 'edit' : 'create'}
        initialData={editingAutomation}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      <LogicBlockBuilder
        open={showLogicBuilder && !isMobile}
        onOpenChange={setShowLogicBuilder}
        onSave={() => queryClient.invalidateQueries({ queryKey: ['automations'] })}
      />

      <LogicBlockBuilderMobile
        open={showLogicBuilder && isMobile}
        onOpenChange={setShowLogicBuilder}
        onSave={() => queryClient.invalidateQueries({ queryKey: ['automations'] })}
      />

      <KeyboardShortcutsHelp
        open={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
        shortcuts={shortcuts}
      />
    </AppLayout>
  );
}

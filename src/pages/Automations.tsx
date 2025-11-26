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
import { SmartAutomationSuggestions } from "@/components/automations/SmartAutomationSuggestions";
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
        "container mx-auto max-w-7xl circuit-board-container min-h-screen pb-12",
        isMobile ? "px-4 pt-6 space-y-8" : "px-6 pt-8 space-y-10"
      )}>
        {/* Emergency Brake - Elevated */}
        <div className="animate-fade-in">
          <EmergencyBrake />
        </div>

        {/* Header - Refined */}
        <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className={cn(
            "flex items-start gap-8",
            isMobile ? "flex-col" : "flex-row items-center justify-between"
          )}>
            <div className="space-y-3">
              <h1 className={cn(
                "font-bold tracking-tight",
                isMobile ? "text-4xl" : "text-5xl"
              )}>
                Automations
              </h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                Describe what you want to automate, or explore smart recipes below
              </p>
            </div>
            {!isMobile && (
              <Button 
                variant="outline"
                size="lg"
                onClick={() => handleOpenModal()}
                className="shrink-0 gap-2"
              >
                <Wrench className="w-5 h-5" />
                Manual Builder
              </Button>
            )}
          </div>
          
          <ConversationalRuleBuilder 
            onRuleCreated={() => queryClient.invalidateQueries({ queryKey: ['automations'] })} 
          />
          
          {isMobile && (
            <Button 
              variant="outline"
              size="lg"
              onClick={() => handleOpenModal()}
              className="w-full gap-2"
            >
              <Wrench className="w-5 h-5" />
              Manual Builder
            </Button>
          )}
        </div>

        {/* Smart Automation Suggestions */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <SmartAutomationSuggestions />
        </div>

        {/* Smart Recipes - Enhanced Card */}
        <div ref={recipesRef} className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <SmartRecipes />
        </div>

        {/* Analytics Dashboard - Enhanced */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <AutomationAnalyticsDashboard />
        </div>

        {/* Advanced Logic Builder - Refined Card */}
        <Card className="glass-panel p-8 border-2 animate-fade-in group" style={{ animationDelay: '0.4s' }}>
          <div className={cn(
            "flex gap-8",
            isMobile ? "flex-col" : "items-center justify-between"
          )}>
            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Blocks className="w-6 h-6 text-primary" />
                </div>
                Advanced Logic Builder
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                Build complex multi-condition automation rules visually with drag-and-drop blocks
              </p>
            </div>
            <Button
              onClick={() => setShowLogicBuilder(true)}
              variant="outline"
              size="lg"
              className={cn("gap-2 shrink-0", isMobile && "w-full")}
            >
              <Blocks className="w-5 h-5" />
              Open Builder
            </Button>
          </div>
        </Card>

        {/* Stats - Refined Cards */}
        {automations && automations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Card className="glass-panel p-8 border-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Rules</p>
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-success" />
                  </div>
                </div>
                <p className="text-5xl font-bold tracking-tight">{activeCount}</p>
              </div>
            </Card>
            <Card className="glass-panel p-8 border-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">This Month</p>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-5xl font-bold tracking-tight">
                  {scheduledAutomations.filter(a => a.is_active).length}
                </p>
              </div>
            </Card>
            <Card className="glass-panel p-8 border-2 bg-accent/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Est. Savings</p>
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <p className="text-5xl font-bold tracking-tight text-accent">
                  ${estimatedMonthlyTotal.toFixed(0)}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Money Flow Visualizer - Refined */}
        {automations && automations.length > 0 && (
          <Card className="glass-panel p-8 border-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Money Flow Circuit</h2>
              </div>
              <MoneyFlowGraph 
                automations={automations.map(auto => ({
                  id: auto.id,
                  rule_name: auto.rule_name,
                  is_active: auto.is_active,
                  action_config: auto.action_config as { amount?: number },
                }))} 
              />
            </div>
          </Card>
        )}

        {/* Two Column Layout (Single Column on Mobile) - Enhanced */}
        <div className={cn(
          "animate-fade-in",
          isMobile ? "space-y-8" : "grid md:grid-cols-3 gap-8"
        )} style={{ animationDelay: '0.7s' }}>
          {/* Left: Automations */}
          <div className="md:col-span-2 space-y-8">
            {/* Smart Rules Section */}
            {transactionMatchAutomations.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold">Smart Rules</h2>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
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
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading automations...</p>
              </div>
            ) : scheduledAutomations.length > 0 ? (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold">Scheduled Transfers</h2>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
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
              <Card className="glass-panel p-16 md:p-24 text-center border-2 border-dashed">
                <div className="max-w-md mx-auto space-y-8">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-accent/10 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-accent" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">No Automations Yet</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Describe your first automation rule above or activate a smart recipe to get started
                    </p>
                  </div>
                </div>
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

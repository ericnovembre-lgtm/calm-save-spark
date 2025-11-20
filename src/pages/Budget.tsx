import { AppLayout } from "@/components/layout/AppLayout";
import { BudgetErrorBoundary } from "@/components/budget/BudgetErrorBoundary";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import { useBudgetRealtime } from "@/hooks/useBudgetRealtime";
import { useCalculateBudgetSpending } from "@/hooks/useCalculateBudgetSpending";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { BudgetHeader } from "@/components/budget/BudgetHeader";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { AICoachPanel } from "@/components/budget/AICoachPanel";
import { BudgetGoalTracker } from "@/components/budget/BudgetGoalTracker";
import { SavingsOpportunities } from "@/components/budget/SavingsOpportunities";
import { BudgetCard } from "@/components/budget/BudgetCard";
import { ScrollSection } from "@/components/animations/ScrollSection";
import { motion } from "framer-motion";
import { CelebrationManager } from "@/components/effects/CelebrationManager";
import { useBudgetMilestones } from "@/hooks/useBudgetMilestones";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, BookOpen, RefreshCw, CalendarCheck } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";
import { NeuralBackground } from "@/components/budget/advanced/NeuralBackground";
import { HolographicCard } from "@/components/budget/advanced/HolographicCard";
import { GestureCard } from "@/components/budget/advanced/GestureCard";
import { MoodTheming } from "@/components/budget/advanced/MoodTheming";
import { AIAssistantAvatar } from "@/components/budget/advanced/AIAssistantAvatar";
import { ScanLineOverlay } from "@/components/budget/advanced/ScanLineOverlay";
import { VideoBackground } from "@/components/budget/advanced/VideoBackground";
import { useBudgetHealth } from "@/hooks/useBudgetHealth";
import { soundEffects } from "@/lib/sound-effects";
import { ParticleSystem } from "@/components/budget/advanced/ParticleSystem";
import { BudgetTemplatesLibrary } from "@/components/budget/BudgetTemplatesLibrary";
import { RecurringBudgetManager } from "@/components/budget/RecurringBudgetManager";
import { PredictiveBudgetingPanel } from "@/components/budget/PredictiveBudgetingPanel";

// Lazy load heavy components
const EnhancedBudgetAnalytics = lazy(() => import("@/components/budget/EnhancedBudgetAnalytics").then(m => ({ default: m.EnhancedBudgetAnalytics })));
const EnhancedCategoryManager = lazy(() => import("@/components/budget/EnhancedCategoryManager").then(m => ({ default: m.EnhancedCategoryManager })));
const CreateBudgetWizard = lazy(() => import("@/components/budget/CreateBudgetWizard").then(m => ({ default: m.CreateBudgetWizard })));
const RuleManager = lazy(() => import("@/components/budget/RuleManager").then(m => ({ default: m.RuleManager })));
const ExportDataManager = lazy(() => import("@/components/budget/ExportDataManager").then(m => ({ default: m.ExportDataManager })));
const InteractiveBudgetOnboarding = lazy(() => import("@/components/budget/InteractiveBudgetOnboarding").then(m => ({ default: m.InteractiveBudgetOnboarding })));

import { withPageMemo } from "@/lib/performance-utils";

export default function Budget() {
  const [activeView, setActiveView] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRuleManager, setShowRuleManager] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>();
  const [showParticles, setShowParticles] = useState(false);
  const [showTemplatesLibrary, setShowTemplatesLibrary] = useState(false);
  const [showRecurringManager, setShowRecurringManager] = useState(false);
  const queryClient = useQueryClient();
  const calculateSpendingMutation = useCalculateBudgetSpending();
  const { celebrationTrigger, checkMilestones } = useBudgetMilestones();

  // Fetch user with optimized cache
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch budgets with optimized cache
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['user_budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch budget spending with optimized cache
  const { data: spending = {} } = useQuery({
    queryKey: ['budget_spending', user?.id],
    queryFn: async () => {
      if (!user) return {};
      const { data, error } = await supabase
        .from('budget_spending')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const spendingMap: Record<string, any> = {};
      data?.forEach(spend => {
        spendingMap[spend.budget_id] = spend;
      });
      return spendingMap;
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch categories with optimized cache
  const { data: categories = [] } = useQuery({
    queryKey: ['budget_categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .or(`is_custom.eq.false,user_id.eq.${user?.id}`)
        .order('is_custom', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch onboarding status
  const { data: onboarding } = useQuery({
    queryKey: ['budget_onboarding', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('budget_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Enable realtime updates
  useBudgetRealtime(user?.id);

  // Proactive alerts
  useBudgetAlerts(budgets, spending);

  // Calculate spending on mount - no longer needed as it's calculated by edge function
  // Removing this to prevent unnecessary API calls

  // Check for budget milestones
  useEffect(() => {
    if (budgets.length > 0 && Object.keys(spending).length > 0) {
      checkMilestones(budgets, spending);
    }
  }, [budgets, spending]);

  // Show onboarding for new users
  useEffect(() => {
    if (onboarding && !onboarding.completed && !onboarding.skipped) {
      setShowOnboarding(true);
    }
  }, [onboarding]);

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('user_budgets')
        .insert([{ ...budgetData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_budgets'] });
      toast.success('Budget created successfully! 🎯');
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  });

  // Complete onboarding
  const handleOnboardingComplete = async () => {
    if (!onboarding) return;
    
    await supabase
      .from('budget_onboarding')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        first_budget_created: true
      })
      .eq('id', onboarding.id);
    
    setShowOnboarding(false);
    queryClient.invalidateQueries({ queryKey: ['budget_onboarding'] });
    toast.success('Welcome to Smart Budgets! 🎉');
  };

  // Skip onboarding
  const handleOnboardingSkip = async () => {
    if (!onboarding) return;
    
    await supabase
      .from('budget_onboarding')
      .update({ skipped: true })
      .eq('id', onboarding.id);
    
    setShowOnboarding(false);
    queryClient.invalidateQueries({ queryKey: ['budget_onboarding'] });
  };

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(String(b.total_limit)), 0);
  const totalSpent = Object.values(spending).reduce((sum: number, s: any) => sum + (s.spent_amount || 0), 0);
  
  // Budget health for mood theming
  const budgetHealth = useBudgetHealth(budgets, spending);
  
  // Video background state based on budget health
  const videoState = budgetHealth === 'critical' ? 'error' : 
                     budgetHealth === 'warning' ? 'warning' :
                     budgetHealth === 'excellent' ? 'success' : 'neutral';

  if (budgetsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
            <div className="animate-spin">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="text-muted-foreground">Loading budgets...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <BudgetErrorBoundary>
        <MoodTheming budgetHealth={budgetHealth}>
          <div className="space-y-6 relative overflow-hidden">
          <NeuralBackground />
          <VideoBackground state={videoState} />
          <ParticleSystem trigger={showParticles} count={30} />
          
          {/* AI Assistant */}
          <AIAssistantAvatar
            message={aiMessage}
            onClick={() => {
              soundEffects.click();
              setAiMessage("I'm analyzing your budget patterns...");
              setTimeout(() => setAiMessage(undefined), 3000);
            }}
          />
          
          {/* Celebration Effects */}
          <CelebrationManager trigger={celebrationTrigger} type="milestone" />

        {/* Onboarding */}
        <Suspense fallback={null}>
          <InteractiveBudgetOnboarding
            isOpen={showOnboarding}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        </Suspense>

        {/* Header */}
        <BudgetHeader
          activeView={activeView}
          onViewChange={setActiveView}
          onCreateBudget={() => setShowCreateModal(true)}
          onExport={() => setShowExportDialog(true)}
          onManageRules={() => setShowRuleManager(true)}
          budgetCount={budgets.length}
        />

        {/* Quick Actions for Advanced Features */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowTemplatesLibrary(true)}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRecurringManager(true)}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recurring
          </Button>
        </div>

        {/* Overview Tab */}
        {/* Automation Promotion */}
        {budgets.length > 0 && (
          <ScrollSection>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Automate Budget Transfers</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule automatic savings based on your budget surplus
                    </p>
                  </div>
                </div>
                <Button onClick={() => window.location.href = '/automations'} variant="ghost">
                  Configure
                </Button>
              </div>
            </Card>
          </ScrollSection>
        )}

        {activeView === 'overview' && (
          <ScrollSection>
            <HolographicCard intensity="high" className="mb-6">
              <BudgetOverview
                totalBudget={totalBudget}
                totalSpent={totalSpent}
                budgets={budgets}
                spending={spending}
                categories={categories}
              />
            </HolographicCard>

            {/* Smart Features Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <HolographicCard intensity="medium">
                <AICoachPanel budgets={budgets} spending={spending} />
              </HolographicCard>
              <HolographicCard intensity="medium">
                <BudgetGoalTracker budgets={budgets} spending={spending} />
              </HolographicCard>
              <HolographicCard intensity="medium">
                <SavingsOpportunities budgets={budgets} spending={spending} />
              </HolographicCard>
            </div>

            {/* Predictive Budgeting */}
            {budgets.length > 0 && (
              <div className="mt-6">
                <PredictiveBudgetingPanel budgetId={budgets[0].id} />
              </div>
            )}

            {budgets.length === 0 ? (
              <Card className="p-12 text-center backdrop-blur-sm bg-card/80 border-border/50 mt-6">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/20">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No budgets yet</h3>
                <p className="text-muted-foreground mb-6">Create your first budget to start tracking your spending</p>
                <MagneticButton
                  onClick={() => setShowCreateModal(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Budget
                </MagneticButton>
              </Card>
            ) : (
              <motion.div 
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {budgets.map((budget, index) => (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 100
                    }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <GestureCard>
                      <HolographicCard intensity="low">
                        <BudgetCard
                          budget={budget as any}
                          spending={spending[budget.id]}
                          categoryData={categories.find(c => c.code === Object.keys((budget.category_limits as any) || {})[0])}
                        />
                      </HolographicCard>
                    </GestureCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </ScrollSection>
        )}

        {/* Analytics Tab */}
        {activeView === 'analytics' && (
          <Suspense fallback={<PageLoadingSkeleton variant="dashboard" />}>
            <EnhancedBudgetAnalytics
              budgets={budgets}
              spending={spending}
            />
          </Suspense>
        )}

        {/* Categories Tab */}
        {activeView === 'categories' && (
          <Suspense fallback={<PageLoadingSkeleton variant="cards" />}>
            <EnhancedCategoryManager categories={categories} />
          </Suspense>
        )}

        {/* Modals */}
        <Suspense fallback={null}>
          <CreateBudgetWizard
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={async (data) => { await createBudgetMutation.mutateAsync(data); }}
            categories={categories}
          />

          <RuleManager
            isOpen={showRuleManager}
            onClose={() => setShowRuleManager(false)}
          />

          <ExportDataManager
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            budgets={budgets}
            spending={spending}
            transactions={[]}
            categories={categories}
          />

          <BudgetTemplatesLibrary
            isOpen={showTemplatesLibrary}
            onClose={() => setShowTemplatesLibrary(false)}
            onSelect={(template) => {
              // Pre-fill create budget dialog with template data
              setShowCreateModal(true);
            }}
          />

          <RecurringBudgetManager
            isOpen={showRecurringManager}
            onClose={() => setShowRecurringManager(false)}
          />
        </Suspense>
      </div>
      </MoodTheming>
      </BudgetErrorBoundary>
    </AppLayout>
  );
}

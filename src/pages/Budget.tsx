import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBudgetRealtime } from "@/hooks/useBudgetRealtime";
import { useCalculateBudgetSpending } from "@/hooks/useCalculateBudgetSpending";
import { BudgetHeader } from "@/components/budget/BudgetHeader";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { BudgetAnalytics } from "@/components/budget/BudgetAnalytics";
import { CategoryManager } from "@/components/budget/CategoryManager";
import { BudgetCard } from "@/components/budget/BudgetCard";
import { CreateBudgetModal } from "@/components/budget/CreateBudgetModal";
import { RuleManager } from "@/components/budget/RuleManager";
import { ExportDialog } from "@/components/budget/ExportDialog";
import { BudgetOnboarding } from "@/components/budget/BudgetOnboarding";
import { ScrollSection } from "@/components/animations/ScrollSection";
import StaggeredContainer, { StaggeredItem } from "@/components/pricing/advanced/StaggeredContainer";
import { CelebrationManager } from "@/components/effects/CelebrationManager";
import { useBudgetMilestones } from "@/hooks/useBudgetMilestones";
import { Card } from "@/components/ui/card";
import { Target, Plus } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function Budget() {
  const [activeView, setActiveView] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRuleManager, setShowRuleManager] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();
  const calculateSpending = useCalculateBudgetSpending();
  const { celebrationTrigger, checkMilestones } = useBudgetMilestones();

  // Fetch user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch budgets
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
  });

  // Fetch budget spending
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
  });

  // Fetch categories
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

  // Enable real-time updates
  useBudgetRealtime(user?.id);

  // Auto-calculate spending for new budgets
  useEffect(() => {
    if (budgets.length > 0 && user) {
      budgets.forEach(budget => {
        // Calculate spending for current period
        const today = new Date();
        let periodStart = new Date();
        let periodEnd = new Date();

        if (budget.period === 'monthly') {
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
          periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (budget.period === 'weekly') {
          const dayOfWeek = today.getDay();
          periodStart = new Date(today);
          periodStart.setDate(today.getDate() - dayOfWeek);
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodStart.getDate() + 6);
        } else if (budget.period === 'annual') {
          periodStart = new Date(today.getFullYear(), 0, 1);
          periodEnd = new Date(today.getFullYear(), 11, 31);
        }

        // Only calculate if we don't have recent spending data
        const existingSpending = spending[budget.id];
        if (!existingSpending || 
            new Date(existingSpending.last_updated).getTime() < Date.now() - 5 * 60 * 1000) {
          calculateSpending.mutate({
            budget_id: budget.id,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0]
          });
        }
      });
    }
  }, [budgets, user, spending]);

  // Check if we should show onboarding
  useEffect(() => {
    if (user && !onboarding && budgets.length === 0) {
      // Create onboarding record
      supabase
        .from('budget_onboarding')
        .insert({ user_id: user.id })
        .then(() => {
          setShowOnboarding(true);
          queryClient.invalidateQueries({ queryKey: ['budget_onboarding'] });
        });
    } else if (onboarding && !onboarding.completed && !onboarding.skipped) {
      setShowOnboarding(true);
    }
  }, [user, onboarding, budgets, queryClient]);

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_budgets')
        .insert({
          user_id: user.id,
          ...budgetData,
          category_limits: budgetData.category_limits || {}
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_budgets'] });
      toast.success('Budget created successfully! 🎉');
      setShowCreateModal(false);
      
      // Update onboarding
      if (onboarding && !onboarding.first_budget_created) {
        supabase
          .from('budget_onboarding')
          .update({ first_budget_created: true })
          .eq('id', onboarding.id)
          .then(() => queryClient.invalidateQueries({ queryKey: ['budget_onboarding'] }));
      }
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  });

  // Complete onboarding
  const handleOnboardingComplete = async () => {
    if (!onboarding || !user) return;
    
    await supabase
      .from('budget_onboarding')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
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
      <div className="space-y-6">
        {/* Celebration Effects */}
        <CelebrationManager trigger={celebrationTrigger} type="milestone" />

        {/* Onboarding */}
        <BudgetOnboarding
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />

        {/* Header */}
        <BudgetHeader
          activeView={activeView}
          onViewChange={setActiveView}
          onCreateBudget={() => setShowCreateModal(true)}
          onExport={() => setShowExportDialog(true)}
          onManageRules={() => setShowRuleManager(true)}
          budgetCount={budgets.length}
        />

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <ScrollSection>
            <BudgetOverview
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              budgets={budgets}
              spending={spending}
              categories={categories}
            />

            {budgets.length === 0 ? (
              <Card className="p-12 text-center backdrop-blur-sm bg-card/80 border-border/50">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/20">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No budgets yet</h3>
                <p className="text-muted-foreground mb-6">Create your first budget to start tracking your spending</p>
                <MagneticButton
                  onClick={() => setShowCreateModal(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-purple-600"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Budget
                </MagneticButton>
              </Card>
            ) : (
              <StaggeredContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {budgets.map((budget) => (
                  <StaggeredItem key={budget.id}>
                    <BudgetCard
                      budget={budget as any}
                      spending={spending[budget.id]}
                      categoryData={categories.find(c => c.code === Object.keys((budget.category_limits as any) || {})[0])}
                    />
                  </StaggeredItem>
                ))}
              </StaggeredContainer>
            )}
          </ScrollSection>
        )}

        {/* Analytics Tab */}
        {activeView === 'analytics' && (
          <BudgetAnalytics
            budgets={budgets}
            spending={spending}
          />
        )}

        {/* Categories Tab */}
        {activeView === 'categories' && (
          <CategoryManager categories={categories} />
        )}

        {/* Modals */}
        <CreateBudgetModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => { await createBudgetMutation.mutateAsync(data); }}
          categories={categories}
        />

        <RuleManager
          isOpen={showRuleManager}
          onClose={() => setShowRuleManager(false)}
        />

        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          budgets={budgets}
          spending={spending}
        />
      </div>
    </AppLayout>
  );
}

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, TrendingDown, DollarSign, Calendar, AlertCircle, CheckCircle, Info, Zap, Timer } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebts } from '@/hooks/useDebts';
import { useDebtPayments } from '@/hooks/useDebtPayments';
import CreateDebtModal from '@/components/debt/CreateDebtModal';
import PayoffSimulator from '@/components/debt/PayoffSimulator';
import DebtAnalytics from '@/components/debt/DebtAnalytics';
import PayoffTimeline from '@/components/debt/PayoffTimeline';
import ContextualCoachTip from '@/components/debt/ContextualCoachTip';
import { DebtCardGrid } from '@/components/debt/DebtCardGrid';
import { DebtMountainVisualizer } from '@/components/debt/DebtMountainVisualizer';
import { CostOfWaitingBadge } from '@/components/debt/CostOfWaitingBadge';
import { StrategyToggle } from '@/components/debt/StrategyToggle';
import { DebtPayoffCalculator } from '@/components/debt/DebtPayoffCalculator';
import { DebtComparisonTool } from '@/components/debt/DebtComparisonTool';
import { DebtMilestoneCelebration } from '@/components/debt/DebtMilestoneCelebration';
import { useDebtMilestones } from '@/hooks/useDebtMilestones';
import { useNavigate } from 'react-router-dom';
import { DebtFreedomCalculator } from '@/components/debt/DebtFreedomCalculator';
import { DebtConsolidationAnalyzer } from '@/components/debt/DebtConsolidationAnalyzer';
import { SmartPaymentScheduler } from '@/components/debt/SmartPaymentScheduler';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useOptimizedDebtSimulation } from '@/hooks/useOptimizedDebtSimulation';
import { useMemo } from 'react';
import { addMonths, format } from 'date-fns';

export default function Debts() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'analytics' | 'timeline'>('overview');
  const [showHelp, setShowHelp] = useState(false);
  const [debtStrategy, setDebtStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  const { debts, isLoading, addDebt, updateDebt, deleteDebt } = useDebts();
  const { payments } = useDebtPayments();
  const { milestone, dismissMilestone } = useDebtMilestones(debts);

  // Optimized debt simulation for Overview tab
  const { summary: currentSummary, simulation: currentSimulation, isLoading: isSimulationLoading } = 
    useOptimizedDebtSimulation({
      strategy: debtStrategy,
      extraPayment: 0,
      enabled: debts.length > 0
    });

  // Calculate debt-free date
  const debtFreeDate = useMemo(() => {
    if (!currentSummary?.months_to_payoff) return null;
    const futureDate = addMonths(new Date(), currentSummary.months_to_payoff);
    return format(futureDate, 'MMMM yyyy');
  }, [currentSummary]);

  const monthsToFreedom = currentSummary?.months_to_payoff || 0;

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const handleCreateDebt = async (debtData: any) => {
    await addDebt(debtData);
    setShowCreateModal(false);
  };

  const handleUpdateDebt = async (debtId: string, updates: any) => {
    updateDebt({ id: debtId, updates });
    setEditingDebt(null);
    setShowCreateModal(false);
  };

  const handleDeleteDebt = async (debt: any) => {
    if (confirm(`Are you sure you want to delete "${debt.debt_name}"?`)) {
      deleteDebt(debt.id);
    }
  };

  const handleCoachChat = (message: string) => {
    navigate('/coach', { state: { initialMessage: message } });
  };

  const totalDebt = debts.reduce((sum, d) => sum + Number(d.current_balance), 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + Number(d.minimum_payment), 0);
  const totalActualPayment = debts.reduce((sum, d) => sum + Number(d.actual_payment || d.minimum_payment), 0);
  const avgInterestRate = debts.length > 0 
    ? debts.reduce((sum, d) => sum + Number(d.interest_rate), 0) / debts.length 
    : 0;

  if (isLoading) return <LoadingState />;

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Contextual Coach Tips */}
        {user && (
          <ContextualCoachTip 
            userId={user.id} 
            pageName="Debts"
            onChatOpen={handleCoachChat}
          />
        )}

        {/* Header Section - More premium feel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-border/50 shadow-card">
            <div className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <TrendingDown className="w-7 h-7 text-primary" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-foreground tracking-tight">Debt Crusher</h1>
                      <motion.button
                        onClick={() => setShowHelp(!showHelp)}
                        className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div 
                          animate={{ rotate: showHelp ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Info className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </motion.button>
                    </div>
                    <p className="text-muted-foreground text-base">
                      AI-powered strategies to eliminate debt faster
                    </p>
                  </div>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => {
                      setEditingDebt(null);
                      setShowCreateModal(true);
                    }}
                    className="gap-2 px-6 py-6 text-base font-medium shadow-lg"
                    size="lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Debt
                  </Button>
                </motion.div>
              </div>

              {/* Help Panel */}
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10 border border-accent/20"
                  >
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-base">
                      <Info className="w-5 h-5 text-accent" />
                      How Debt Crusher Works
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex gap-2">
                        <span className="text-accent font-medium">•</span>
                        <div>
                          <strong className="text-foreground">Snowball Method:</strong> Pay smallest debts first for momentum
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-accent font-medium">•</span>
                        <div>
                          <strong className="text-foreground">Avalanche Method:</strong> Target high interest to save more
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-accent font-medium">•</span>
                        <div>
                          <strong className="text-foreground">AI Insights:</strong> Personalized predictions and strategies
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-accent font-medium">•</span>
                        <div>
                          <strong className="text-foreground">Smart Scheduler:</strong> Optimized payment timing
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab Navigation - More refined */}
              <div className="flex gap-2 mt-8 pt-6 border-t border-border/50">
                {[
                  { id: 'overview', label: 'Overview', icon: DollarSign },
                  { id: 'simulator', label: 'Simulator', icon: Zap },
                  { id: 'analytics', label: 'Analytics', icon: TrendingDown },
                  { id: 'timeline', label: 'Timeline', icon: Calendar }
                ].map(tab => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 flex items-center gap-2 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Debt Mountain Hero Section */}
            {debts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <DebtMountainVisualizer
                  simulation={currentSimulation}
                  debtFreeDate={debtFreeDate}
                  monthsToFreedom={monthsToFreedom}
                  isLoading={isSimulationLoading}
                />
              </motion.div>
            )}

            {/* AI-Powered Insights Section */}
            <div className="space-y-4">
              {/* Debt Freedom Calculator - AI Prediction */}
              {debts.length > 0 && user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <DebtFreedomCalculator 
                    debts={debts}
                    userId={user.id}
                    currentStrategy={debtStrategy}
                  />
                </motion.div>
              )}

              {/* Cost of Waiting Badge */}
              {debts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <CostOfWaitingBadge debts={debts} />
                </motion.div>
              )}
            </div>

            {/* Tools & Calculators Section */}
            <div className="space-y-4">
              {/* Debt Payoff Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <DebtPayoffCalculator strategy={debtStrategy} hasDebts={debts.length > 0} />
              </motion.div>

              {/* Debt Consolidation Analyzer */}
              {debts.length > 1 && user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <DebtConsolidationAnalyzer debts={debts} userId={user.id} />
                </motion.div>
              )}

              {/* Debt Comparison Tool */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <DebtComparisonTool debts={debts} />
              </motion.div>
            </div>

            {/* Automation Card - Enhanced design */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="p-6 border-2 border-accent/30 hover:border-accent/60 transition-all shadow-card hover:shadow-glass-elevated bg-gradient-to-br from-card to-accent/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Timer className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Automate Payments</h3>
                      <p className="text-sm text-muted-foreground">
                        Set up recurring transfers and never miss a payment
                      </p>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => navigate('/automations')} variant="default" size="default" className="gap-2">
                      <Zap className="w-4 h-4" />
                      Set Up Automation
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Summary Cards - More refined with better visual hierarchy */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="p-6 border-border/50 shadow-card hover:shadow-glass-elevated transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Debt</h3>
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        ${totalDebt.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <DollarSign className="w-5 h-5 text-destructive" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {debts.length} active debt{debts.length !== 1 ? 's' : ''}
                  </p>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="p-6 border-border/50 shadow-card hover:shadow-glass-elevated transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Monthly Payment</h3>
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        ${totalActualPayment.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimum: ${totalMinPayment.toLocaleString()}
                  </p>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="p-6 border-border/50 shadow-card hover:shadow-glass-elevated transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Avg Interest</h3>
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        {avgInterestRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-warning/10">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Annual percentage rate
                  </p>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="p-6 border-border/50 shadow-card hover:shadow-glass-elevated transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Extra Payment</h3>
                      <p className="text-3xl font-bold text-success tracking-tight">
                        ${(totalActualPayment - totalMinPayment).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-success/10">
                      <TrendingDown className="w-5 h-5 text-success" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accelerating payoff
                  </p>
                </Card>
              </motion.div>
            </motion.div>

            {/* Strategy Toggle - Enhanced */}
            {debts.length > 0 && (
              <motion.div 
                className="flex justify-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="inline-flex p-2 bg-muted/30 rounded-2xl border border-border/50">
                  <StrategyToggle 
                    strategy={debtStrategy} 
                    onChange={setDebtStrategy} 
                  />
                </div>
              </motion.div>
            )}

            {/* Bills & Subscriptions Card - More refined */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="p-6 border-2 border-secondary/40 hover:border-secondary/70 transition-all shadow-card hover:shadow-glass-elevated bg-gradient-to-br from-card to-secondary/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Calendar className="w-6 h-6 text-accent" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Bills & Subscriptions</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Monitor recurring expenses and find savings opportunities
                      </p>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => navigate('/subscriptions')} 
                      variant="outline"
                      className="gap-2 whitespace-nowrap border-accent/30 hover:border-accent/60"
                    >
                      Manage Bills
                      <TrendingDown className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Debt Cards - Enhanced empty state */}
            {debts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-16 text-center border-border/50 shadow-card">
                  <motion.div 
                    className="p-8 rounded-full w-28 h-28 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-success/10 to-success/20"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CheckCircle className="w-14 h-14 text-success" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Debt-Free Living!</h3>
                  <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
                    You have no active debts. Keep up the excellent financial habits!
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2 px-6 py-6" size="lg">
                      <Plus className="w-5 h-5" />
                      Track a Debt
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ) : (
              <DebtCardGrid
                debts={debts}
                payments={payments}
                strategy={debtStrategy}
                onUpdate={handleUpdateDebt}
                onDelete={handleDeleteDebt}
                onEdit={(debt) => {
                  setEditingDebt(debt);
                  setShowCreateModal(true);
                }}
              />
            )}
          </motion.div>
        )}

        {/* Simulator Tab */}
        {activeTab === 'simulator' && (
          <>
            <PayoffSimulator debts={debts} userId={user?.id} />
            
            {/* Smart Payment Scheduler */}
            {debts.length > 0 && user && (
              <SmartPaymentScheduler 
                debts={debts}
                userId={user.id}
                onScheduleUpdate={handleUpdateDebt}
              />
            )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <DebtAnalytics debts={debts} payments={payments} userId={user?.id} />
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <PayoffTimeline debts={debts} userId={user?.id} />
        )}

        {/* Create/Edit Modal */}
        <CreateDebtModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingDebt(null);
          }}
          onSave={editingDebt 
            ? (data) => handleUpdateDebt(editingDebt.id, data) 
            : handleCreateDebt
          }
          debt={editingDebt}
        />
      </div>

      {/* Debt Milestone Celebration */}
      <DebtMilestoneCelebration milestone={milestone} onDismiss={dismissMilestone} />
    </AppLayout>
  );
}

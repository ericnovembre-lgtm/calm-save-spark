import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, TrendingDown, DollarSign, Calendar, AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebts } from '@/hooks/useDebts';
import { useDebtPayments } from '@/hooks/useDebtPayments';
import DebtCard from '@/components/debt/DebtCard';
import CreateDebtModal from '@/components/debt/CreateDebtModal';
import PayoffSimulator from '@/components/debt/PayoffSimulator';
import DebtAnalytics from '@/components/debt/DebtAnalytics';
import PayoffTimeline from '@/components/debt/PayoffTimeline';
import ContextualCoachTip from '@/components/debt/ContextualCoachTip';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function Debts() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'analytics' | 'timeline'>('overview');
  const [showHelp, setShowHelp] = useState(false);

  const { debts, isLoading, addDebt, updateDebt, deleteDebt } = useDebts();
  const { payments } = useDebtPayments();

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
      <div className="space-y-6">
        {/* Contextual Coach Tips */}
        {user && (
          <ContextualCoachTip 
            userId={user.id} 
            pageName="Debts"
            onChatOpen={handleCoachChat}
          />
        )}

        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">Debt Management</h1>
                  <motion.button
                    onClick={() => setShowHelp(!showHelp)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div animate={{ rotate: showHelp ? 180 : 0 }}>
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </motion.button>
                </div>
                <p className="text-muted-foreground mt-1">Track and eliminate your debts faster</p>
              </div>
            </div>
            
            <Button
              onClick={() => {
                setEditingDebt(null);
                setShowCreateModal(true);
              }}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Debt
            </Button>
          </div>

          {/* Help Panel */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="p-4 rounded-lg bg-primary/5 border border-primary/10"
              >
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  About Debt Management
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• <strong>Snowball Method:</strong> Pay off smallest debts first for quick wins</p>
                  <p>• <strong>Avalanche Method:</strong> Target highest interest rates to save money</p>
                  <p>• <strong>Smart Simulator:</strong> Compare strategies and see your debt-free date</p>
                  <p>• <strong>Integration:</strong> Debts automatically factor into your financial health score</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mt-6 border-b border-border">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'simulator', label: 'Payoff Simulator', icon: Zap },
              { id: 'analytics', label: 'Analytics', icon: TrendingDown },
              { id: 'timeline', label: 'Timeline', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Debt</h3>
                  <DollarSign className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  ${totalDebt.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Across {debts.length} debt{debts.length !== 1 ? 's' : ''}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Monthly Payment</h3>
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  ${totalActualPayment.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Min: ${totalMinPayment.toLocaleString()}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Avg Interest Rate</h3>
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {avgInterestRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Annual rate
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Extra Payment</h3>
                  <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${(totalActualPayment - totalMinPayment).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Accelerating payoff
                </p>
              </Card>
            </div>

            {/* Debt Cards */}
            {debts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-500/10">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Debt-free!</h3>
                <p className="text-muted-foreground mb-6">You have no active debts. Great job!</p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Track a Debt
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {debts.map(debt => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    payments={payments.filter(p => p.debt_id === debt.id)}
                    onUpdate={(updates) => handleUpdateDebt(debt.id, updates)}
                    onDelete={() => handleDeleteDebt(debt)}
                    onEdit={() => {
                      setEditingDebt(debt);
                      setShowCreateModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Simulator Tab */}
        {activeTab === 'simulator' && (
          <PayoffSimulator debts={debts} userId={user?.id} />
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
    </AppLayout>
  );
}

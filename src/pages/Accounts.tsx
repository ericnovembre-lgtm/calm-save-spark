import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { LazyPlaidLink } from "@/components/accounts/LazyPlaidLink";
import { Helmet } from "react-helmet";
import { LiquidityHero } from "@/components/accounts/LiquidityHero";
import { PhysicalAccountCard } from "@/components/accounts/PhysicalAccountCard";
import { TransferDialog } from "@/components/accounts/TransferDialog";
import { YieldHunterChip } from "@/components/accounts/YieldHunterChip";
import { AICFOAssistant } from "@/components/accounts/AICFOAssistant";
import { LiquidityForecastChart } from "@/components/accounts/LiquidityForecastChart";
import { useDragToTransfer } from "@/hooks/useDragToTransfer";
import { useAccountsRealtime } from "@/hooks/useAccountsRealtime";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useDemoAccounts } from "@/hooks/useDemoAccounts";
import { Link } from "react-router-dom";
import { AlertCircle, Play } from "lucide-react";

const Accounts = () => {
  const queryClient = useQueryClient();
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemoMode();
  const { accounts: demoAccounts, forecast: demoForecast } = useDemoAccounts();
  
  const [transferDialog, setTransferDialog] = useState<{
    open: boolean;
    fromAccount?: any;
    toAccount?: any;
  }>({ open: false });

  // Fetch real accounts only if not in demo mode
  const { data: realAccounts, isLoading } = useQuery({
    queryKey: ['connected_accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !isDemoMode,
  });

  // Use demo accounts if in demo mode, otherwise use real accounts
  const accounts = isDemoMode ? demoAccounts : realAccounts;

  // Get user ID for realtime (only if not in demo mode)
  const [userId, setUserId] = useState<string>();
  useEffect(() => {
    if (!isDemoMode) {
      supabase.auth.getUser().then(({ data }) => {
        setUserId(data.user?.id);
      });
    }
  }, [isDemoMode]);

  // Enable realtime sync for connected accounts
  useAccountsRealtime(userId);

  const handleDrop = (fromAccountId: string, toAccountId: string) => {
    const fromAcc = accounts?.find(a => a.id === fromAccountId);
    const toAcc = accounts?.find(a => a.id === toAccountId);

    if (fromAcc && toAcc) {
      setTransferDialog({
        open: true,
        fromAccount: {
          id: fromAcc.id,
          name: fromAcc.institution_name,
          balance: fromAcc.current_balance || fromAcc.balance || 0,
        },
        toAccount: {
          id: toAcc.id,
          name: toAcc.institution_name,
          balance: toAcc.current_balance || toAcc.balance || 0,
        },
      });
    }
  };

  const { 
    hoveredZone, 
    registerDropZone, 
    getDragHandlers,
    isDragging,
    draggedAccountId 
  } = useDragToTransfer({ onDrop: handleDrop });

  const handleYieldTransfer = (fromAccountId: string, toAccountId: string, amount: number) => {
    const fromAcc = accounts?.find(a => a.id === fromAccountId);
    const toAcc = accounts?.find(a => a.id === toAccountId);

    if (fromAcc && toAcc) {
      setTransferDialog({
        open: true,
        fromAccount: {
          id: fromAcc.id,
          name: fromAcc.institution_name,
          balance: fromAcc.current_balance || fromAcc.balance || 0,
        },
        toAccount: {
          id: toAcc.id,
          name: toAcc.institution_name,
          balance: toAcc.current_balance || toAcc.balance || 0,
        },
      });
    }
  };

  // Group accounts by type
  const liquidAccounts = accounts?.filter(a => 
    ['checking', 'savings'].includes(a.account_type)
  ) || [];
  const debtAccounts = accounts?.filter(a => 
    ['credit_card', 'loan'].includes(a.account_type)
  ) || [];
  const investmentAccounts = accounts?.filter(a => 
    a.account_type === 'investment'
  ) || [];

  return (
    <AppLayout>
      <Helmet>
        <title>Accounts | $ave+</title>
        <meta name="description" content="Your liquidity command center" />
      </Helmet>

      <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
              Liquidity Command Center
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Visualize, optimize, and move your money
            </p>
          </div>
          {!isDemoMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <LazyPlaidLink onSuccess={() => queryClient.invalidateQueries({ queryKey: ['connected_accounts'] })} />
            </motion.div>
          )}
        </motion.div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-warning/10 border-warning backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <AlertTitle className="text-sm sm:text-base">🎭 Demo Mode Active</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-sm">Exploring with sample data. Connect real accounts to get started.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disableDemoMode}
                  className="whitespace-nowrap"
                >
                  Exit Demo
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Liquidity Hero */}
        <LiquidityHero />

        {/* 90-Day Liquidity Forecast Chart */}
        {accounts && accounts.length > 0 && (
          <LiquidityForecastChart demoForecast={isDemoMode ? demoForecast : undefined} />
        )}

        {/* Liquid (Cash) Section */}
        {liquidAccounts.length > 0 && (
          <motion.section 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="h-1 w-8 bg-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 32 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Liquid (Cash)</h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-64 bg-muted/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liquidAccounts.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.5 + index * 0.1,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <PhysicalAccountCard
                      id={account.id}
                      institutionName={account.institution_name}
                      accountType={account.account_type}
                      accountMask={account.account_mask}
                      balance={account.current_balance || account.balance || 0}
                      currency={account.currency}
                      apy={account.apy}
                      nickname={account.nickname}
                      lastSynced={account.last_synced}
                      color="cyan"
                      isHovered={hoveredZone === account.id}
                      isDragging={draggedAccountId === account.id}
                      dragHandlers={getDragHandlers(account.id)}
                      onRegisterDropZone={registerDropZone}
                    />
                </motion.div>
              ))}
            </div>
          )}
          </motion.section>
        )}

        {/* Borrowed (Debt) Section */}
        <motion.section 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="h-1 w-8 bg-rose-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Borrowed (Debt)</h2>
          </div>

          {/* $ave+ Credit Card Promotion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-rose-500/5 to-rose-500/10 border-rose-500/20 hover:shadow-glass-elevated transition-shadow duration-300">
              <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <path d="M2 10h20"/>
                    </svg>
                    $ave+ Credit Card
                  </CardTitle>
                  <CardDescription>Build credit while you spend</CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link to="/card">
                    Manage Cards →
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Apply for a secured credit card and start building your credit history today.
              </p>
            </CardContent>
            </Card>
          </motion.div>

          {debtAccounts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debtAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.7 + index * 0.1,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <PhysicalAccountCard
                    id={account.id}
                    institutionName={account.institution_name}
                    accountType={account.account_type}
                    accountMask={account.account_mask}
                    balance={account.current_balance || account.balance || 0}
                    currency={account.currency}
                    nickname={account.nickname}
                    lastSynced={account.last_synced}
                    color="rose"
                    onRegisterDropZone={registerDropZone}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Locked (Investments) Section */}
        {investmentAccounts.length > 0 && (
          <motion.section 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="h-1 w-8 bg-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 32 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Locked (Investments)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.7 + index * 0.1,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <PhysicalAccountCard
                    id={account.id}
                    institutionName={account.institution_name}
                    accountType={account.account_type}
                    accountMask={account.account_mask}
                    balance={account.current_balance || account.balance || 0}
                    currency={account.currency}
                    nickname={account.nickname}
                    lastSynced={account.last_synced}
                    color="violet"
                    onRegisterDropZone={registerDropZone}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty state */}
        {!isLoading && !isDemoMode && accounts?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors duration-300">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                <motion.div 
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No accounts connected yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md px-4">
                  Connect your first bank account to unlock your liquidity command center
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <LazyPlaidLink onSuccess={() => queryClient.invalidateQueries({ queryKey: ['connected_accounts'] })} />
                  <Button variant="outline" onClick={enableDemoMode} className="gap-2">
                    <Play className="w-4 h-4" />
                    Try Demo First
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Transfer Dialog */}
      {transferDialog.fromAccount && transferDialog.toAccount && (
        <TransferDialog
          open={transferDialog.open}
          onOpenChange={(open) => setTransferDialog({ open })}
          fromAccount={transferDialog.fromAccount}
          toAccount={transferDialog.toAccount}
        />
      )}

      {/* Yield Hunter Chip */}
      <YieldHunterChip onTransferClick={handleYieldTransfer} />

      {/* AI CFO Assistant */}
      <AICFOAssistant />
    </AppLayout>
  );
};

export default Accounts;
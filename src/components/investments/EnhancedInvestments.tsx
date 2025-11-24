import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveTreemap } from "./InteractiveTreemap";
import { LiveTickerTape } from "./LiveTickerTape";
import { PerformanceChart } from "./PerformanceChart";
import { AIInsightsCard } from "./AIInsightsCard";
import { SmartRebalancingPanel } from "./SmartRebalancingPanel";
import { PlaidInvestmentLink } from "./PlaidInvestmentLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, Sparkles, Shield, Play, Settings } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import CountUp from 'react-countup';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_INVESTMENT_ACCOUNTS, DEMO_PORTFOLIO_HOLDINGS } from '@/lib/demo-data';
import { useDriftDetection } from '@/hooks/useDriftDetection';
import { AlertCircle } from 'lucide-react';
import { AllocationSettingsModal } from './AllocationSettingsModal';
import { PortfolioGoals } from './PortfolioGoals';

interface EnhancedInvestmentsProps {
  userId: string;
}

export function EnhancedInvestments({ userId }: EnhancedInvestmentsProps) {
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const { isDemoMode, enableDemoMode } = useDemoMode();
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  const { data: dbAccounts, isLoading } = useQuery({
    queryKey: ['investment_accounts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !isDemoMode,
  });

  const { data: dbHoldings } = useQuery({
    queryKey: ['portfolio_holdings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !isDemoMode,
  });

  // Use demo data when demo mode is active, otherwise use database data
  const accounts = (isDemoMode ? DEMO_INVESTMENT_ACCOUNTS : dbAccounts) as any;
  const holdings = (isDemoMode ? DEMO_PORTFOLIO_HOLDINGS : dbHoldings) as any;

  // Initial data load effect - populate benchmark and market data if empty
  useEffect(() => {
    const checkAndLoadInitialData = async () => {
      try {
        // Check if benchmark data exists
        const { data: benchmarkData } = await supabase
          .from('benchmark_data')
          .select('*')
          .limit(1);

        if (!benchmarkData || benchmarkData.length === 0) {
          console.log('Loading initial benchmark data...');
          const { data: { session } } = await supabase.auth.getSession();
          
          // Trigger initial benchmark data load (30 days historical)
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-benchmark-data`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ initial: true }),
            }
          );
          
          toast.success('Loading market benchmarks...');
        }

        // Check if holdings exist and trigger market data fetch
        if (holdings && holdings.length > 0) {
          const { data: marketData } = await supabase
            .from('market_data_cache')
            .select('*')
            .limit(1);

          if (!marketData || marketData.length === 0) {
            console.log('Loading initial market data...');
            const { data: { session } } = await supabase.auth.getSession();
            
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-market-data`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    checkAndLoadInitialData();
  }, [holdings]);

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-investments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio_holdings'] });
      toast.success('Portfolio synced successfully');
    },
  });

  const totalValue = Array.isArray(accounts) ? accounts.reduce((sum: number, acc: any) => sum + parseFloat(String(acc.total_value)), 0) : 0;
  const totalCostBasis = Array.isArray(accounts) ? accounts.reduce((sum: number, acc: any) => sum + parseFloat(String(acc.cost_basis || 0)), 0) : 0;
  const totalGains = totalValue - totalCostBasis;
  const gainsPercent = totalCostBasis > 0 ? (totalGains / totalCostBasis) * 100 : 0;

  // Sector color mapping
  const getSectorColor = (accountType: string) => {
    const normalized = accountType.toLowerCase();
    if (normalized.includes('brokerage') || normalized.includes('investment')) return '#3b82f6'; // Blue for Stocks
    if (normalized.includes('crypto')) return '#f59e0b'; // Orange for Crypto
    if (normalized.includes('bond') || normalized.includes('fixed')) return '#10b981'; // Green for Bonds
    if (normalized.includes('cash') || normalized.includes('savings')) return '#6b7280'; // Gray for Cash
    return '#8b5cf6'; // Purple default
  };

  // Transform accounts into hierarchical treemap data grouped by account type
  const treemapData = (() => {
    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) return [];

    // Group accounts by type
    const grouped = accounts.reduce((acc: Record<string, any[]>, account: any) => {
      const type = account.account_type || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(account);
      return acc;
    }, {});

    // Transform into hierarchical structure
    return Object.entries(grouped as Record<string, any[]>).map(([type, accs]: [string, any[]]) => {
      const children = accs.map((acc: any) => {
        const value = parseFloat(String(acc.total_value));
        const costBasis = parseFloat(String(acc.cost_basis || 0));
        const gainPercent = costBasis > 0 ? ((value - costBasis) / costBasis) * 100 : 0;
        
        return {
          name: acc.account_name,
          value,
          gainPercent,
        };
      });

      const totalValue = children.reduce((sum: number, child: any) => sum + child.value, 0);
      const totalCostBasis = accs.reduce((sum: number, acc: any) => sum + parseFloat(String(acc.cost_basis || 0)), 0);
      const weightedGainPercent = totalCostBasis > 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0;

      return {
        name: type,
        value: totalValue,
        gainPercent: weightedGainPercent,
        color: getSectorColor(type),
        children,
      };
    });
  })();

  const portfolioDataForAI = {
    totalValue,
    totalGains,
    gainsPercent,
    accounts: accounts || []
  };

  // Load user allocation preferences
  const { data: userPreferences } = useQuery({
    queryKey: ['user_preferences', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('portfolio_allocation_target')
        .eq('user_id', userId)
        .single();
      return data;
    },
  });

  // Drift detection with user's custom target
  const targetAllocation = userPreferences?.portfolio_allocation_target 
    ? (userPreferences.portfolio_allocation_target as Record<string, number>)
    : undefined;
  
  const driftData = useDriftDetection(treemapData, targetAllocation);

  // Calculate current allocation percentages
  const currentAllocation = (() => {
    const total = treemapData.reduce((sum, item) => sum + item.value, 0);
    return treemapData.reduce((acc, item) => {
      const key = item.name.toLowerCase().includes('brokerage') || item.name.toLowerCase().includes('investment') ? 'brokerage' :
                  item.name.toLowerCase().includes('bond') || item.name.toLowerCase().includes('fixed') ? 'bond' :
                  item.name.toLowerCase().includes('crypto') ? 'crypto' :
                  item.name.toLowerCase().includes('cash') ? 'cash' : 'other';
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      acc[key] = (acc[key] || 0) + percent;
      return acc;
    }, {} as Record<string, number>);
  })();

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Terminal-style Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Total Portfolio Value
          </p>
          <div className="text-2xl font-mono tabular-nums text-slate-100">
            $<CountUp 
              end={totalValue} 
              duration={prefersReducedMotion ? 0 : 1.5} 
              decimals={0} 
              separator="," 
              preserveValue
            />
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Total Gains/Losses
          </p>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-mono tabular-nums ${totalGains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGains >= 0 ? '+' : ''}$<CountUp 
                end={Math.abs(totalGains)} 
                duration={prefersReducedMotion ? 0 : 1.5} 
                decimals={0} 
                separator="," 
                preserveValue
              />
            </div>
            {totalGains >= 0 ? 
              <TrendingUp className="w-4 h-4 text-green-400" /> : 
              <TrendingDown className="w-4 h-4 text-red-400" />
            }
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Return on Investment
          </p>
          <div className={`text-2xl font-mono tabular-nums ${gainsPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {gainsPercent >= 0 ? '+' : ''}<CountUp 
              end={Math.abs(gainsPercent)} 
              duration={prefersReducedMotion ? 0 : 1.5} 
              decimals={2} 
              preserveValue
            />%
          </div>
        </Card>
      </div>

      {/* Live Ticker Tape */}
      {holdings && Array.isArray(holdings) && holdings.length > 0 && (
        <LiveTickerTape holdings={holdings} />
      )}

      {/* AI Insights */}
      {accounts && Array.isArray(accounts) && accounts.length > 0 && (
        <AIInsightsCard portfolioData={portfolioDataForAI} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Interactive Treemap */}
        {treemapData.length > 0 && (
          <InteractiveTreemap data={treemapData} />
        )}

        {/* Performance Chart */}
        <PerformanceChart userId={userId} />
      </div>

      {/* Portfolio Goals */}
      {totalValue > 0 && (
        <PortfolioGoals userId={userId} totalPortfolioValue={totalValue} />
      )}

      {/* Drift Detection Alert */}
      {driftData.hasDrift && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-500 mb-1">
                ⚠️ Portfolio Drift Detected
              </h4>
              <p className="text-sm text-slate-300 mb-3">
                Your portfolio has drifted {driftData.driftPercent.toFixed(1)}% from target allocation. 
                {driftData.affectedAssets.length > 0 && (
                  <span className="block mt-1">
                    Affected: {driftData.affectedAssets.map(a => a.name).join(', ')}
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30"
                  onClick={() => {
                    document.getElementById('rebalancing-panel')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  Review Suggestions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAllocationModalOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Adjust Targets
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Smart Rebalancing */}
      {accounts && Array.isArray(accounts) && accounts.length > 0 && (
        <div id="rebalancing-panel">
          <SmartRebalancingPanel 
            userId={userId} 
            portfolioData={portfolioDataForAI} 
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          Sync Portfolio
        </Button>
        
        {accounts && Array.isArray(accounts) && accounts.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setIsAllocationModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Target Allocation
          </Button>
        )}
      </div>

      {/* Allocation Settings Modal */}
      <AllocationSettingsModal
        open={isAllocationModalOpen}
        onOpenChange={setIsAllocationModalOpen}
        userId={userId}
        currentAllocation={currentAllocation}
      />

      {(!accounts || !Array.isArray(accounts) || accounts.length === 0) && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-3">
              Start Building Your Portfolio
            </h3>
            
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Connect your brokerage account to track investments, get AI-powered insights, 
              and optimize your portfolio with real-time market data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl w-full">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">Real-Time Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor holdings with live market data
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">AI Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Get personalized portfolio recommendations
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">Secure Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Bank-level encryption via Plaid
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <PlaidInvestmentLink 
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['investment_accounts'] });
                  queryClient.invalidateQueries({ queryKey: ['portfolio_holdings'] });
                }} 
              />
              
              <Button 
                variant="outline"
                onClick={enableDemoMode}
              >
                <Play className="w-4 h-4 mr-2" />
                View Demo Portfolio
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Supports all major brokerages including Fidelity, Schwab, E*TRADE, and more
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
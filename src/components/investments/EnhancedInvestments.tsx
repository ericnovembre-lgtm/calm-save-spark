import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveTreemap } from "./InteractiveTreemap";
import { LiveTickerTape } from "./LiveTickerTape";
import { PerformanceChart } from "./PerformanceChart";
import { AIInsightsCard } from "./AIInsightsCard";
import { SmartRebalancingPanel } from "./SmartRebalancingPanel";
import { PlaidInvestmentLink } from "./PlaidInvestmentLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, Sparkles, Shield } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

interface EnhancedInvestmentsProps {
  userId: string;
}

export function EnhancedInvestments({ userId }: EnhancedInvestmentsProps) {
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
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
  });

  const { data: holdings } = useQuery({
    queryKey: ['portfolio_holdings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
  });

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

  const totalValue = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.total_value)), 0) || 0;
  const totalCostBasis = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.cost_basis || 0)), 0) || 0;
  const totalGains = totalValue - totalCostBasis;
  const gainsPercent = totalCostBasis > 0 ? (totalGains / totalCostBasis) * 100 : 0;

  // Transform accounts into treemap data
  const treemapData = accounts?.map((acc, idx) => {
    const colors = [
      'hsl(var(--primary))', 
      'hsl(var(--accent))', 
      '#10b981', 
      '#f59e0b', 
      '#ef4444', 
      '#8b5cf6'
    ];
    
    return {
      name: acc.account_name,
      value: parseFloat(String(acc.total_value)),
      color: colors[idx % colors.length],
    };
  }) || [];

  const portfolioDataForAI = {
    totalValue,
    totalGains,
    gainsPercent,
    accounts: accounts || []
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Gains/Losses</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${totalGains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalGains >= 0 ? '+' : ''}${totalGains.toLocaleString()}
            </p>
            {totalGains >= 0 ? 
              <TrendingUp className="w-5 h-5 text-green-500" /> : 
              <TrendingDown className="w-5 h-5 text-red-500" />
            }
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Return on Investment</p>
          <p className={`text-3xl font-bold ${gainsPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {gainsPercent >= 0 ? '+' : ''}{gainsPercent.toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Live Ticker Tape */}
      {holdings && holdings.length > 0 && (
        <LiveTickerTape holdings={holdings} />
      )}

      {/* AI Insights */}
      {accounts && accounts.length > 0 && (
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

      {/* Smart Rebalancing */}
      {accounts && accounts.length > 0 && (
        <SmartRebalancingPanel 
          userId={userId} 
          portfolioData={portfolioDataForAI} 
        />
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
      </div>

      {accounts?.length === 0 && (
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

            <PlaidInvestmentLink 
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['investment_accounts'] });
                queryClient.invalidateQueries({ queryKey: ['portfolio_holdings'] });
              }} 
            />

            <p className="text-xs text-muted-foreground mt-6">
              Supports all major brokerages including Fidelity, Schwab, E*TRADE, and more
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
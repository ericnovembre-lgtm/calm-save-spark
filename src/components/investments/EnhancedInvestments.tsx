import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveTreemap } from "./InteractiveTreemap";
import { LiveTickerTape } from "./LiveTickerTape";
import { PerformanceChart } from "./PerformanceChart";
import { AIInsightsCard } from "./AIInsightsCard";
import { SmartRebalancingPanel } from "./SmartRebalancingPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Plus, TrendingUp, TrendingDown } from "lucide-react";
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
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-2">No investment accounts yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first account to start tracking
          </p>
        </Card>
      )}
    </div>
  );
}
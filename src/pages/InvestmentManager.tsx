import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioOverview } from '@/components/investment-manager/PortfolioOverview';
import { TaxLossHarvesting } from '@/components/investment-manager/TaxLossHarvesting';
import { RebalancingActions } from '@/components/investment-manager/RebalancingActions';
import { MandateConfig } from '@/components/investment-manager/MandateConfig';
import { Loader2, TrendingUp, Scale, Receipt, Settings } from 'lucide-react';

export default function InvestmentManager() {
  const { data: mandate, isLoading } = useQuery({
    queryKey: ['investment-mandate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_mandates')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio-holdings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .order('market_value', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: tlhOpportunities } = useQuery({
    queryKey: ['tlh-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_loss_harvest_opportunities')
        .select('*')
        .eq('status', 'pending')
        .order('potential_tax_savings', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalValue = portfolio?.reduce((sum, h) => sum + (Number(h.market_value) || 0), 0) || 0;
  const totalGainLoss = portfolio?.reduce((sum, h) => sum + (Number(h.unrealized_gain_loss) || 0), 0) || 0;
  const potentialTaxSavings = tlhOpportunities?.reduce((sum, o) => sum + Number(o.potential_tax_savings), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Autonomous Investment Manager</h1>
          <p className="text-muted-foreground mt-2">
            24/7 portfolio optimization, tax-loss harvesting, and automatic rebalancing
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold mt-1">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unrealized Gain/Loss</p>
              <p className={`text-2xl font-bold mt-1 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Scale className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Potential Tax Savings</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                ${potentialTaxSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="tlh">Tax-Loss Harvesting</TabsTrigger>
          <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
          <TabsTrigger value="mandate">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <PortfolioOverview holdings={portfolio || []} />
        </TabsContent>

        <TabsContent value="tlh">
          <TaxLossHarvesting opportunities={tlhOpportunities || []} />
        </TabsContent>

        <TabsContent value="rebalancing">
          <RebalancingActions mandate={mandate} />
        </TabsContent>

        <TabsContent value="mandate">
          <MandateConfig existingMandate={mandate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

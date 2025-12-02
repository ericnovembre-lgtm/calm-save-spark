import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioOverview } from '@/components/investment-manager/PortfolioOverview';
import { TaxLossHarvesting } from '@/components/investment-manager/TaxLossHarvesting';
import { RebalancingActions } from '@/components/investment-manager/RebalancingActions';
import { MandateConfig } from '@/components/investment-manager/MandateConfig';
import { TrendingUp, Scale, Receipt, Settings, Target, Zap, Shield, BarChart3 } from 'lucide-react';
import { PageLoadingSkeleton } from '@/components/ui/page-loading-skeleton';
import { FeatureEmptyState } from '@/components/ui/feature-empty-state';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { withErrorHandling } from '@/lib/errorHandling';
import { AppLayout } from '@/components/layout/AppLayout';

export default function InvestmentManager() {
  const { data: mandate, isLoading } = useQuery({
    queryKey: ['investment-mandate'],
    queryFn: () => withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('investment_mandates')
          .select('*')
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      },
      { action: 'loading investment mandate', component: 'InvestmentManager' }
    ),
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio-holdings'],
    queryFn: () => withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('portfolio_holdings')
          .select('*')
          .order('market_value', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      { action: 'loading portfolio holdings', component: 'InvestmentManager' }
    ),
  });

  const { data: tlhOpportunities } = useQuery({
    queryKey: ['tlh-opportunities'],
    queryFn: () => withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('tax_loss_harvest_opportunities')
          .select('*')
          .eq('status', 'pending')
          .order('potential_tax_savings', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      { action: 'loading tax-loss harvesting opportunities', component: 'InvestmentManager' }
    ),
  });

  if (isLoading) {
    return <PageLoadingSkeleton variant="dashboard" />;
  }

  const hasPortfolio = portfolio && portfolio.length > 0;

  const totalValue = portfolio?.reduce((sum, h) => sum + (Number(h.market_value) || 0), 0) || 0;
  const totalGainLoss = portfolio?.reduce((sum, h) => sum + (Number(h.unrealized_gain_loss) || 0), 0) || 0;
  const potentialTaxSavings = tlhOpportunities?.reduce((sum, o) => sum + Number(o.potential_tax_savings), 0) || 0;

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Autonomous Investment Manager</h1>
              <p className="text-muted-foreground mt-2">
                24/7 portfolio optimization, tax-loss harvesting, and automatic rebalancing
              </p>
            </div>
          </div>

          {!hasPortfolio ? (
            <FeatureEmptyState
              icon={TrendingUp}
              title="Start Your Investment Journey"
              description="Set up your investment mandate and connect your brokerage accounts to enable 24/7 autonomous portfolio management."
              actionLabel="Configure Mandate"
              features={[
                { icon: Target, label: 'Set your risk tolerance & goals' },
                { icon: Zap, label: 'Automatic tax-loss harvesting' },
                { icon: Shield, label: 'Continuous rebalancing' },
                { icon: BarChart3, label: 'Performance tracking' },
              ]}
            />
          ) : (
            <>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
            </>
          )}
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}

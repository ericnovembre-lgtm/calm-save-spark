import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpportunityCard } from '@/components/refinancing/OpportunityCard';
import { RateMonitor } from '@/components/refinancing/RateMonitor';
import { RefinancingHistory } from '@/components/refinancing/RefinancingHistory';
import { LoanRateAlerts } from '@/components/refinancing/LoanRateAlerts';
import { Loader2, TrendingDown, DollarSign, Clock } from 'lucide-react';

export default function RefinancingHub() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['refinancing-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refinancing_opportunities')
        .select('*')
        .in('status', ['pending', 'reviewing'])
        .order('net_savings', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: marketRates } = useQuery({
    queryKey: ['market-loan-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_loan_rates')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(50);
      
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

  const totalSavings = opportunities?.reduce((sum, o) => sum + Number(o.net_savings), 0) || 0;
  const avgSavings = opportunities && opportunities.length > 0 ? totalSavings / opportunities.length : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proactive Liability Agent</h1>
          <p className="text-muted-foreground mt-2">
            24/7 monitoring of loan markets to automatically identify and execute refinancing opportunities
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Opportunities</p>
              <p className="text-2xl font-bold mt-1">{opportunities?.length || 0}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Potential Savings</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                ${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Savings per Loan</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                ${avgSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="rates">Market Rates</TabsTrigger>
          <TabsTrigger value="alerts">Rate Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          {opportunities && opportunities.length > 0 ? (
            <div className="grid gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Opportunities Right Now</h3>
              <p className="text-muted-foreground mt-2">
                The agent is monitoring markets 24/7. You'll be notified when refinancing opportunities arise.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rates">
          <RateMonitor rates={marketRates || []} />
        </TabsContent>

        <TabsContent value="alerts">
          <LoanRateAlerts />
        </TabsContent>

        <TabsContent value="history">
          <RefinancingHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { OpportunityCard } from "@/components/bill-negotiation/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, DollarSign, CheckCircle2 } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

export default function BillNegotiation() {
  const queryClient = useQueryClient();
  const [analyzingBills, setAnalyzingBills] = useState(false);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['bill-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bill_negotiation_opportunities')
        .select('*')
        .order('estimated_savings', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: requests } = useQuery({
    queryKey: ['bill-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bill_negotiation_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-bills');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bill-opportunities'] });
      toast.success(`Found ${data.opportunities_found} negotiation opportunities with potential savings of $${data.total_potential_savings}`);
    },
    onError: () => {
      toast.error('Failed to analyze bills');
    },
  });

  const requestMutation = useMutation({
    mutationFn: async ({ opportunityId, merchant, currentAmount }: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('bill_negotiation_requests')
        .insert([{
          user_id: user.id,
          opportunity_id: opportunityId,
          merchant,
          current_amount: currentAmount,
          status: 'pending',
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-requests'] });
      toast.success('Negotiation request submitted! We\'ll contact you within 2-3 business days.');
    },
    onError: () => {
      toast.error('Failed to submit request');
    },
  });

  const handleAnalyzeBills = async () => {
    setAnalyzingBills(true);
    await analyzeMutation.mutateAsync();
    setAnalyzingBills(false);
  };

  const handleRequestNegotiation = (opportunity: any) => {
    requestMutation.mutate({
      opportunityId: opportunity.id,
      merchant: opportunity.merchant,
      currentAmount: opportunity.current_amount,
    });
  };

  if (isLoading) return <LoadingState />;

  const totalPotentialSavings = opportunities?.reduce(
    (sum, o) => sum + Number(o.estimated_savings),
    0
  ) || 0;

  const completedRequests = requests?.filter(r => r.status === 'completed') || [];
  const totalActualSavings = completedRequests.reduce(
    (sum, r) => sum + Number(r.actual_savings || 0),
    0
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Bill Negotiation
            </h1>
            <p className="text-muted-foreground">
              Let us negotiate lower rates on your recurring bills
            </p>
          </div>
          <Button onClick={handleAnalyzeBills} disabled={analyzingBills}>
            <RefreshCw className={`w-4 h-4 mr-2 ${analyzingBills ? 'animate-spin' : ''}`} />
            Analyze Bills
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${totalPotentialSavings.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Potential Savings/mo</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{opportunities?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Opportunities Found</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${totalActualSavings.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Saved</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList>
            <TabsTrigger value="opportunities">
              Opportunities ({opportunities?.filter(o => o.status === 'identified').length || 0})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({requests?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            {opportunities?.filter(o => o.status === 'identified').length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No negotiation opportunities found yet.
                </p>
                <Button onClick={handleAnalyzeBills} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze Your Bills
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {opportunities
                  ?.filter(o => o.status === 'identified')
                  .map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      merchant={opportunity.merchant}
                      category={opportunity.category}
                      currentAmount={Number(opportunity.current_amount)}
                      estimatedSavings={Number(opportunity.estimated_savings)}
                      confidenceScore={Number(opportunity.confidence_score)}
                      onRequestNegotiation={() => handleRequestNegotiation(opportunity)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {requests?.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No negotiation requests yet. Submit a request from the Opportunities tab.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests?.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {request.merchant}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Requested on {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                        {request.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{request.notes}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={
                          request.status === 'completed' ? 'default' :
                          request.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {request.status}
                        </Badge>
                        
                        {request.status === 'completed' && request.actual_savings && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground">Savings</div>
                            <div className="text-lg font-bold text-green-600">
                              ${Number(request.actual_savings).toFixed(2)}/mo
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { OpportunityCard } from "@/components/bill-negotiation/OpportunityCard";
import { BillScanner } from "@/components/bill-negotiation/BillScanner";
import { BillNegotiationScriptDialog } from "@/components/bill-negotiation/BillNegotiationScriptDialog";
import { NegotiationSuccessDialog } from "@/components/bill-negotiation/NegotiationSuccessDialog";
import { TacticalCard } from "@/components/bill-negotiation/TacticalCard";
import { NegotiationTimeline } from "@/components/bill-negotiation/NegotiationTimeline";
import { NegotiationMetrics } from "@/components/bill-negotiation/NegotiationMetrics";
import { CompetitorIntelligencePanel } from "@/components/bill-negotiation/CompetitorIntelligencePanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, DollarSign, CheckCircle2, Target, TrendingUp, Zap, FileText } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

export default function BillNegotiation() {
  const queryClient = useQueryClient();
  
  // All state hooks first
  const [analyzingBills, setAnalyzingBills] = useState(false);
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [competitorOffer, setCompetitorOffer] = useState<any>(null);

  // All query hooks
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

  // All mutation hooks
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

  // Effect hooks after all other hooks
  useEffect(() => {
    if (requests && requests.length > 0) {
      const latestCompleted = requests
        .filter(r => r.status === 'completed')
        .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())[0];
      
      if (latestCompleted && latestCompleted.actual_savings) {
        const timeSinceCompletion = Date.now() - new Date(latestCompleted.completed_at || 0).getTime();
        
        // Show dialog if completed within last 5 seconds
        if (timeSinceCompletion < 5000) {
          setSuccessData({
            merchant: latestCompleted.merchant,
            monthlySavings: Number(latestCompleted.actual_savings),
            yearlySavings: Number(latestCompleted.actual_savings) * 12,
          });
          setSuccessDialogOpen(true);
        }
      }
    }
  }, [requests]);

  // Handler functions
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

  const handleGenerateScript = (opportunity: any, competitor?: any) => {
    setSelectedOpportunity(opportunity);
    setCompetitorOffer(competitor || null);
    setScriptDialogOpen(true);
  };

  // Early return AFTER all hooks
  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  // Derived calculations after loading check
  const totalPotentialSavings = opportunities?.reduce(
    (sum, o) => sum + Number(o.estimated_savings),
    0
  ) || 0;

  const completedRequests = requests?.filter(r => r.status === 'completed') || [];
  const totalActualSavings = completedRequests.reduce(
    (sum, r) => sum + Number(r.actual_savings || 0),
    0
  );

  const annualSavings = totalActualSavings * 12;

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-950 space-y-8">
        {/* Tactical Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-display font-bold text-foreground"
              >
                Bill Negotiation <span className="text-cyan-400">Command Center</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground font-mono text-sm"
              >
                TACTICAL INTELLIGENCE • AUTOMATED NEGOTIATION • MAXIMUM SAVINGS
              </motion.p>
            </div>
            <Button 
              onClick={handleAnalyzeBills} 
              disabled={analyzingBills}
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${analyzingBills ? 'animate-spin' : ''}`} />
              Scan Bills
            </Button>
          </div>
        </div>

        {/* Bill Scanner Hero */}
        <BillScanner onScanComplete={(analysis) => {
          // Auto-create opportunity from scan
          toast.success('Bill scanned! Review the opportunity below.');
        }} />

        {/* Tactical Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TacticalCard glowColor="emerald">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-muted-foreground font-mono">
                    POTENTIAL SAVINGS
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 font-mono">
                    $<CountUp end={totalPotentialSavings} decimals={2} duration={1} />
                  </div>
                  <div className="text-xs text-muted-foreground">/month</div>
                </div>
              </div>
            </div>
          </TacticalCard>

          <TacticalCard glowColor="cyan">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-muted-foreground font-mono">
                    TARGETS ACQUIRED
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 font-mono">
                    <CountUp end={opportunities?.length || 0} duration={1} />
                  </div>
                  <div className="text-xs text-muted-foreground">opportunities</div>
                </div>
              </div>
            </div>
          </TacticalCard>

          <TacticalCard glowColor="amber">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <CheckCircle2 className="w-8 h-8 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-muted-foreground font-mono">
                    ANNUAL IMPACT
                  </div>
                  <div className="text-3xl font-bold text-amber-400 font-mono">
                    $<CountUp end={annualSavings} decimals={0} duration={1} />
                  </div>
                  <div className="text-xs text-muted-foreground">/year saved</div>
                </div>
              </div>
            </div>
          </TacticalCard>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="opportunities">
              <Target className="w-4 h-4 mr-2" />
              Opportunities ({opportunities?.filter(o => o.status === 'identified').length || 0})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <FileText className="w-4 h-4 mr-2" />
              Requests ({requests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="w-4 h-4 mr-2" />
              History ({completedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="intelligence">
              <Zap className="w-4 h-4 mr-2" />
              Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            {opportunities?.filter(o => o.status === 'identified').length === 0 ? (
              <TacticalCard>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No negotiation opportunities found yet.
                  </p>
                  <Button onClick={handleAnalyzeBills} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Analyze Your Bills
                  </Button>
                </div>
              </TacticalCard>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {opportunities
                  ?.filter(o => o.status === 'identified')
                  .map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      id={opportunity.id}
                      merchant={opportunity.merchant}
                      category={opportunity.category}
                      currentAmount={Number(opportunity.current_amount)}
                      estimatedSavings={Number(opportunity.estimated_savings)}
                      confidenceScore={Number(opportunity.confidence_score)}
                      metadata={opportunity.metadata}
                      onRequestNegotiation={() => handleRequestNegotiation(opportunity)}
                      onGenerateScript={() => handleGenerateScript(opportunity)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {requests?.length === 0 ? (
              <TacticalCard>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No negotiation requests yet. Submit a request from the Opportunities tab.
                  </p>
                </div>
              </TacticalCard>
            ) : (
              <div className="space-y-4">
                {requests?.map((request) => (
                  <TacticalCard 
                    key={request.id}
                    glowColor={request.status === 'completed' ? 'emerald' : 'cyan'}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-xl text-foreground mb-2">
                            {request.merchant}
                          </h3>
                          <p className="text-sm text-muted-foreground font-mono">
                            Requested: {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{request.notes}</p>
                          )}
                        </div>
                        
                        <div className="text-right space-y-2">
                          <Badge 
                            variant={request.status === 'completed' ? 'default' : 'outline'}
                            className={`font-mono ${
                              request.status === 'completed' 
                                ? 'bg-emerald-600' 
                                : request.status === 'in_progress'
                                ? 'border-cyan-500 text-cyan-400'
                                : ''
                            }`}
                          >
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          
                          {request.status === 'completed' && request.actual_savings && (
                            <div className="pt-2">
                              <div className="text-xs text-muted-foreground font-mono">SAVINGS</div>
                              <div className="text-2xl font-bold text-emerald-400 font-mono">
                                ${Number(request.actual_savings).toFixed(2)}
                              </div>
                              <div className="text-xs text-emerald-300">/month</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TacticalCard>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {completedRequests.length > 0 && (
              <NegotiationMetrics requests={requests || []} />
            )}
            <NegotiationTimeline requests={completedRequests} />
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence">
            <CompetitorIntelligencePanel 
              opportunities={opportunities || []}
              onGenerateScript={handleGenerateScript}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs - Always render, control via open prop */}
      <BillNegotiationScriptDialog
        open={scriptDialogOpen && selectedOpportunity !== null}
        onOpenChange={setScriptDialogOpen}
        merchant={selectedOpportunity?.merchant || ''}
        amount={Number(selectedOpportunity?.current_amount || 0)}
        category={selectedOpportunity?.category}
        competitorOffer={competitorOffer}
        leveragePoints={selectedOpportunity?.metadata?.leverage_points}
        bloatItems={selectedOpportunity?.metadata?.bloat_items}
        contractEndDate={selectedOpportunity?.metadata?.contract_end_date}
        customerTenure={selectedOpportunity?.metadata?.customer_tenure_years}
        negotiationScore={selectedOpportunity?.metadata?.negotiation_score}
      />

      <NegotiationSuccessDialog
        open={successDialogOpen && successData !== null}
        onOpenChange={setSuccessDialogOpen}
        merchant={successData?.merchant || ''}
        monthlySavings={successData?.monthlySavings || 0}
        yearlySavings={successData?.yearlySavings || 0}
      />
    </AppLayout>
  );
}
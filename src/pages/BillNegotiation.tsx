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
import { ScriptVariantSelector } from "@/components/bill-negotiation/ScriptVariantSelector";
import { ScriptAnalyticsDashboard } from "@/components/bill-negotiation/ScriptAnalyticsDashboard";
import { OutcomeTrackingDialog } from "@/components/bill-negotiation/OutcomeTrackingDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GlassPanel } from "@/components/ui/glass-panel";
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
  const [variantSelectorOpen, setVariantSelectorOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [competitorOffer, setCompetitorOffer] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);

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
    setVariantSelectorOpen(true);
  };

  const handleVariantSelected = (variant: 'aggressive' | 'friendly' | 'data_driven', scriptId: string) => {
    setSelectedVariantId(scriptId);
    setVariantSelectorOpen(false);
    
    // Track analytics
    toast.success(`${variant.toUpperCase().replace('_', '-')} script selected!`, {
      description: 'Use this script to negotiate with confidence',
    });

    // Show outcome tracking after 5 minutes (simulated)
    setTimeout(() => {
      setOutcomeDialogOpen(true);
    }, 10000); // 10 seconds for demo, change to 300000 (5 minutes) in production
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
      <div className="min-h-screen bg-background space-y-8">
        {/* Header */}
        <GlassPanel variant="subtle" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-display font-bold text-foreground"
              >
                Bill Negotiation <span className="text-accent">Hub</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-sm"
              >
                Smart savings through strategic negotiation
              </motion.p>
            </div>
            <Button 
              onClick={handleAnalyzeBills} 
              disabled={analyzingBills}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${analyzingBills ? 'animate-spin' : ''}`} />
              Analyze Bills
            </Button>
          </div>
        </GlassPanel>

        {/* Bill Scanner Hero */}
        <BillScanner onScanComplete={(analysis) => {
          // Auto-create opportunity from scan
          toast.success('Bill scanned! Review the opportunity below.');
        }} />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassPanel className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/20 rounded-xl">
                <TrendingUp className="w-8 h-8 text-foreground/70" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Potential Savings
                </div>
                <div className="text-3xl font-bold text-foreground">
                  $<CountUp end={totalPotentialSavings} decimals={2} duration={1} />
                </div>
                <div className="text-xs text-muted-foreground">/month</div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/20 rounded-xl">
                <Target className="w-8 h-8 text-foreground/70" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Opportunities Found
                </div>
                <div className="text-3xl font-bold text-foreground">
                  <CountUp end={opportunities?.length || 0} duration={1} />
                </div>
                <div className="text-xs text-muted-foreground">targets</div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/20 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-foreground/70" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Annual Impact
                </div>
                <div className="text-3xl font-bold text-foreground">
                  $<CountUp end={annualSavings} decimals={0} duration={1} />
                </div>
                <div className="text-xs text-muted-foreground">/year saved</div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            {opportunities?.filter(o => o.status === 'identified').length === 0 ? (
              <GlassPanel className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No negotiation opportunities found yet.
                </p>
                <Button onClick={handleAnalyzeBills} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze Your Bills
                </Button>
              </GlassPanel>
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
              <GlassPanel className="p-8 text-center">
                <p className="text-muted-foreground">
                  No negotiation requests yet. Submit a request from the Opportunities tab.
                </p>
              </GlassPanel>
            ) : (
              <div className="space-y-4">
                {requests?.map((request) => (
                  <GlassPanel key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
...
                    </div>
                  </GlassPanel>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <ScriptAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Variant Selector Dialog */}
      <Dialog open={variantSelectorOpen} onOpenChange={setVariantSelectorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-cyan-500/30">
          <ScriptVariantSelector
            merchant={selectedOpportunity?.merchant || ''}
            amount={Number(selectedOpportunity?.current_amount || 0)}
            category={selectedOpportunity?.category}
            leveragePoints={selectedOpportunity?.metadata?.leverage_points}
            bloatItems={selectedOpportunity?.metadata?.bloat_items}
            competitorOffer={competitorOffer}
            negotiationScore={selectedOpportunity?.metadata?.negotiation_score}
            contractEndDate={selectedOpportunity?.metadata?.contract_end_date}
            customerTenure={selectedOpportunity?.metadata?.customer_tenure_years}
            opportunityId={selectedOpportunity?.id}
            onVariantSelected={handleVariantSelected}
            onClose={() => setVariantSelectorOpen(false)}
          />
        </DialogContent>
      </Dialog>

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

      {/* Outcome Tracking Dialog */}
      {selectedVariantId && selectedOpportunity && (
        <OutcomeTrackingDialog
          open={outcomeDialogOpen}
          onOpenChange={setOutcomeDialogOpen}
          variantId={selectedVariantId}
          originalAmount={Number(selectedOpportunity.current_amount)}
        />
      )}
    </AppLayout>
  );
}
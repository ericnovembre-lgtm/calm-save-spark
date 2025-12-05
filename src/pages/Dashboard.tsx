import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles, AlertCircle, LayoutGrid, Wand2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// AI Generative Components
import { useClaudeGenerativeDashboard } from "@/hooks/useClaudeGenerativeDashboard";
import { AIThemeProvider } from "@/components/dashboard/generative/AIThemeProvider";
import { GenerativeBriefing } from "@/components/dashboard/generative/GenerativeBriefing";
import { GenerativeDashboardSkeleton } from "@/components/dashboard/generative/GenerativeDashboardSkeleton";
import { UnifiedGenerativeGrid } from "@/components/dashboard/generative/UnifiedGenerativeGrid";
import { ClassicDashboard } from "@/components/dashboard/ClassicDashboard";

// Essential Dashboard Features
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { UnifiedFAB } from "@/components/dashboard/UnifiedFAB";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { useAnnounce } from "@/components/accessibility/LiveRegionAnnouncer";
import { SyncIndicator } from "@/components/ui/sync-indicator";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { useChatSidebar } from "@/hooks/useChatSidebar";
import { DashboardErrorBoundary } from "@/components/error/DashboardErrorBoundary";
import { MilestoneCelebration } from "@/components/effects/MilestoneCelebration";
import { useMilestoneDetector } from "@/hooks/useMilestoneDetector";
import { AuroraMeshBackground } from "@/components/dashboard/AuroraMeshBackground";
import { SmartBanner } from "@/components/dashboard/SmartBanner";
import { ProactiveNudgesBanner } from "@/components/dashboard/ProactiveNudgesBanner";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { AnomalyAlertCenter } from "@/components/ai/AnomalyAlertCenter";
import { NaturalLanguageCommander } from "@/components/dashboard/NaturalLanguageCommander";
import { AdHocChartPanel } from "@/components/dashboard/AdHocChartPanel";
import { LottieCelebrations } from "@/components/effects/LottieCelebrations";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import { WhatsNewModal } from "@/components/dashboard/WhatsNewModal";
import { FeatureSpotlight } from "@/components/dashboard/FeatureSpotlight";
import { NewUserSpotlight } from "@/components/onboarding/NewUserSpotlight";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionAlerts } from "@/hooks/useTransactionAlerts";
import { TransactionAlertBanner } from "@/components/alerts/TransactionAlertToast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type DashboardViewMode = 'ai' | 'classic';

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isOpen: isChatOpen, toggle: toggleChat } = useChatSidebar();
  const { announce } = useAnnounce();
  const isMobile = useIsMobile();
  
  // Dashboard view mode (persisted to localStorage)
  const [viewMode, setViewMode] = useState<DashboardViewMode>(() => {
    const saved = localStorage.getItem('dashboard-view-mode');
    return (saved as DashboardViewMode) || 'ai';
  });
  
  // Persist view mode
  const handleViewModeChange = (mode: DashboardViewMode) => {
    setViewMode(mode);
    localStorage.setItem('dashboard-view-mode', mode);
    toast.success(mode === 'ai' ? 'Switched to AI Dashboard' : 'Switched to Classic Dashboard');
  };
  
  // NLQ state
  const [nlqQuery, setNlqQuery] = useState('');
  const [isNlqProcessing, setIsNlqProcessing] = useState(false);
  const [showAdHocChart, setShowAdHocChart] = useState(false);
  const [adHocChartData, setAdHocChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [adHocInsight, setAdHocInsight] = useState('');
  
  // Celebrations state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'success' | 'achievement' | 'goal' | 'milestone'>('success');
  
  // Check onboarding status
  useOnboardingStatus(true);
  
  // Sync status
  const { status: syncStatus, lastSynced, forceRefresh } = useSyncStatus();
  
  // Claude Opus 4.5 Generative Dashboard
  const {
    layout,
    widgets,
    theme,
    briefing,
    reasoning,
    isLoading: isGenerating,
    error: generationError,
    context: aiContext,
    meta,
    lastRefresh,
    refresh: regenerateDashboard,
    streamingText
  } = useClaudeGenerativeDashboard();

  // Query profile for tutorial state
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile-tutorial', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('show_dashboard_tutorial')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    if (!user?.id) return;
    await supabase
      .from('profiles')
      .update({ show_dashboard_tutorial: false })
      .eq('id', user.id);
    refetchProfile();
  };

  // Real-time transaction alerts
  const { alerts: transactionAlerts, markAllAsRead: markAlertsRead } = useTransactionAlerts();

  // Calculate net worth change for aurora background
  const totalSavings = aiContext?.totalSavings || 0;
  const netWorthChangePercent = totalSavings > 0 ? ((aiContext?.streak || 0) / 100) * 10 : 0;
  
  // Milestone detection for celebrations
  const { milestone, dismissMilestone } = useMilestoneDetector(totalSavings);

  // NLQ handler
  const handleNLQuery = async (query: string) => {
    setNlqQuery(query);
    setIsNlqProcessing(true);
    setShowAdHocChart(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-nlq-chart', {
        body: { query }
      });

      if (error) throw error;

      setAdHocChartData(data.chartData || []);
      setAdHocInsight(data.insight || 'Analysis complete.');
    } catch (error) {
      console.error('NLQ query failed:', error);
      toast.error('Failed to analyze query');
      setAdHocChartData([]);
      setAdHocInsight('Unable to analyze your spending at this time.');
    } finally {
      setIsNlqProcessing(false);
    }
  };

  // Pull to refresh handler
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['connected_accounts'] }),
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['pots'] }),
      queryClient.invalidateQueries({ queryKey: ['goals'] }),
      regenerateDashboard()
    ]);
    toast.success('Dashboard refreshed with AI!');
  };

  // Announce to screen readers when dashboard is ready
  useEffect(() => {
    if (!isGenerating && aiContext) {
      announce(`Dashboard ready. ${briefing?.summary || 'Your personalized financial overview.'}`, 'polite');
    }
  }, [isGenerating, aiContext, briefing, announce]);

  const dashboardContent = (
    <AIThemeProvider theme={theme}>
      <DashboardErrorBoundary sectionName="AI Dashboard">
        <div className="min-h-screen relative">
          {/* Aurora Background with net worth sentiment */}
          <AuroraMeshBackground netWorthChangePercent={netWorthChangePercent} />
          
          {/* Skip Links for Accessibility */}
          <SkipLinks />

          {/* Banners */}
          <EmailVerificationBanner />
          <SmartBanner />
          <ProactiveNudgesBanner />
          {transactionAlerts.length > 0 && (
            <TransactionAlertBanner 
              alerts={transactionAlerts}
              onViewAll={() => navigate('/transactions')}
              onDismissAll={() => markAlertsRead()}
            />
          )}

          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: isGenerating ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
                  >
                    <Sparkles className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">$ave+ Dashboard</h1>
                    <p className="text-xs text-muted-foreground">
                      Powered by Claude Opus 4.5 • {meta?.model || 'AI-Generated'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center rounded-lg border border-border/50 p-0.5 bg-muted/30">
                    <Button
                      variant={viewMode === 'ai' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('ai')}
                      className={cn(
                        "h-7 px-3 text-xs",
                        viewMode === 'ai' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">AI</span>
                    </Button>
                    <Button
                      variant={viewMode === 'classic' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('classic')}
                      className={cn(
                        "h-7 px-3 text-xs",
                        viewMode === 'classic' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <LayoutGrid className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Classic</span>
                    </Button>
                  </div>

                  <SyncIndicator status={syncStatus} lastSynced={lastSynced} onRefresh={forceRefresh} />
                  
                  {viewMode === 'ai' && lastRefresh && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {lastRefresh.toLocaleTimeString()}
                    </span>
                  )}
                  
                  {viewMode === 'ai' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regenerateDashboard}
                      disabled={isGenerating}
                      className="border-border/50"
                    >
                      <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                      <span className="hidden sm:inline">Regenerate</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main id="main-content" className={cn(
            "container mx-auto px-4 py-6 transition-all duration-300",
            isChatOpen && !isMobile && "mr-96"
          )}>
            {/* Error State */}
            {generationError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {generationError}. Showing default layout.
                </AlertDescription>
              </Alert>
            )}

            {/* NLQ Commander */}
            <div className="mb-6" data-tour="nlq-commander">
              <NaturalLanguageCommander 
                onQuery={handleNLQuery}
                isProcessing={isNlqProcessing}
              />
            </div>

            {/* Ad-hoc Chart Panel */}
            <AdHocChartPanel
              isOpen={showAdHocChart}
              onClose={() => setShowAdHocChart(false)}
              query={nlqQuery}
              data={adHocChartData}
              insight={adHocInsight}
              isLoading={isNlqProcessing}
            />

            {/* View Mode Content */}
            {viewMode === 'classic' ? (
              <ClassicDashboard />
            ) : isGenerating ? (
              <GenerativeDashboardSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* AI Briefing */}
                <GenerativeBriefing
                  briefing={briefing}
                  theme={theme}
                  reasoning={reasoning}
                  meta={meta}
                  streamingText={streamingText}
                />

                {/* Unified Generative Widget Grid */}
                <UnifiedGenerativeGrid
                  layout={layout}
                  widgets={widgets}
                  theme={theme}
                />

                {/* Context Summary */}
                {aiContext && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground py-4"
                  >
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {aiContext.timeOfDay}
                    </span>
                    <span>•</span>
                    <span>${aiContext.totalSavings?.toLocaleString() || '0'} saved</span>
                    <span>•</span>
                    <span>{aiContext.goalsCount || 0} goals</span>
                    <span>•</span>
                    <span>{aiContext.streak || 0} day streak</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-border/50 py-4 mt-8">
            <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                Dashboard personalized by Claude Opus 4.5
              </p>
            </div>
          </footer>

          {/* Floating Elements */}
          <UnifiedFAB />
          <CommandPalette />
          <ChatSidebar isOpen={isChatOpen} onToggle={toggleChat} />
          <AnomalyAlertCenter />

          {/* Celebrations */}
          {milestone && (
            <MilestoneCelebration
              milestone={milestone}
              onDismiss={dismissMilestone}
            />
          )}
          <LottieCelebrations
            type={celebrationType}
            isVisible={showCelebration}
            onComplete={() => setShowCelebration(false)}
          />

          {/* Onboarding */}
          {profile?.show_dashboard_tutorial && (
            <DashboardTour />
          )}
          <WhatsNewModal />
          <FeatureSpotlight />
          <NewUserSpotlight />
        </div>
      </DashboardErrorBoundary>
    </AIThemeProvider>
  );

  // Mobile: wrap with PullToRefresh
  if (isMobile) {
    return (
      <AppLayout>
        <PullToRefresh onRefresh={handleRefresh}>
          {dashboardContent}
        </PullToRefresh>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {dashboardContent}
    </AppLayout>
  );
}

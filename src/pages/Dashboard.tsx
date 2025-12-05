import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardErrorBoundary } from "@/components/error/DashboardErrorBoundary";
import { AIThemeProvider } from "@/components/dashboard/generative/AIThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useClaudeGenerativeDashboard } from "@/hooks/useClaudeGenerativeDashboard";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useFinancialStories } from "@/hooks/useFinancialStories";
import { useMilestoneDetector } from "@/hooks/useMilestoneDetector";
import { useOfflineDashboard } from "@/hooks/useOfflineDashboard";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { useChatSidebar } from "@/hooks/useChatSidebar";
import { useTransactionAlerts } from "@/hooks/useTransactionAlerts";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useAnnounce } from "@/components/accessibility/LiveRegionAnnouncer";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

// Consolidated sub-components
import { DashboardShell } from "@/components/dashboard/shell/DashboardShell";
import { DashboardContent } from "@/components/dashboard/content/DashboardContent";
import { DashboardBanners } from "@/components/dashboard/banners/DashboardBanners";
import { DashboardStories } from "@/components/dashboard/stories/DashboardStories";
import { DashboardModals } from "@/components/dashboard/modals/DashboardModals";
import { DashboardCelebrations } from "@/components/dashboard/celebrations/DashboardCelebrations";
import { DashboardOnboarding } from "@/components/dashboard/onboarding/DashboardOnboarding";
import { FloatingControls } from "@/components/dashboard/floating/FloatingControls";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { announce } = useAnnounce();
  const { isOpen: isChatOpen, toggle: toggleChat } = useChatSidebar();
  
  // Consolidated state management
  const [state, actions] = useDashboardState();
  
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

  // Consolidated handlers
  const handlers = useDashboardHandlers({
    actions,
    regenerateDashboard,
    userId: user?.id,
  });

  // Financial stories
  const { stories, markAsViewed, isViewed } = useFinancialStories();
  
  // Milestone detection
  const totalSavings = aiContext?.totalSavings || 0;
  const { milestone, dismissMilestone } = useMilestoneDetector(totalSavings);
  
  // Offline & sync support
  const { isOffline, isStale, lastCachedAt, hasCache } = useOfflineDashboard();
  const { isSyncing, triggerSync } = useAutoSync({
    onSync: regenerateDashboard,
    hasCachedData: hasCache,
    isStale: isStale
  });
  const { status: syncStatus, lastSynced, forceRefresh } = useSyncStatus();
  
  // Transaction alerts
  const { alerts: transactionAlerts, markAllAsRead: markAlertsRead } = useTransactionAlerts();
  
  // Onboarding
  useOnboardingStatus(true);
  const { data: profile } = useQuery({
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

  // Net worth change for aurora background
  const netWorthChangePercent = totalSavings > 0 ? ((aiContext?.streak || 0) / 100) * 10 : 0;

  // Screen reader announcement
  useEffect(() => {
    if (!isGenerating && aiContext) {
      announce(`Dashboard ready. ${briefing?.summary || 'Your personalized financial overview.'}`, 'polite');
    }
  }, [isGenerating, aiContext, briefing, announce]);

  return (
    <AppLayout>
      <AIThemeProvider theme={theme}>
        <DashboardErrorBoundary sectionName="AI Dashboard">
          <DashboardShell
            isGenerating={isGenerating}
            modelName={meta?.model}
            syncStatus={syncStatus}
            lastSynced={lastSynced}
            lastRefresh={lastRefresh}
            netWorthChangePercent={netWorthChangePercent}
            onRefresh={regenerateDashboard}
            onForceRefresh={forceRefresh}
          >
            {/* Stories */}
            <DashboardStories
              stories={stories}
              activeStoryIndex={state.activeStoryIndex}
              onStoryClick={actions.setActiveStoryIndex}
              onClose={() => actions.setActiveStoryIndex(null)}
              onStoryViewed={markAsViewed}
              isViewed={isViewed}
            />

            {/* Banners */}
            <DashboardBanners
              isOffline={isOffline}
              isSyncing={isSyncing}
              isStale={isStale}
              lastCachedAt={lastCachedAt}
              transactionAlerts={transactionAlerts}
              onRefresh={triggerSync}
              onNavigateTransactions={() => navigate('/transactions')}
              onDismissAlerts={markAlertsRead}
            />

            {/* Main Content */}
            <DashboardContent
              isGenerating={isGenerating}
              generationError={generationError}
              layout={layout}
              widgets={widgets}
              theme={theme}
              briefing={briefing}
              reasoning={reasoning}
              meta={meta}
              streamingText={streamingText}
              aiContext={aiContext}
              isChatOpen={isChatOpen}
              isMobile={isMobile}
              onModalOpen={actions.setActiveModal}
              nlqQuery={state.nlq.query}
              nlqIsProcessing={state.nlq.isProcessing}
              nlqShowChart={state.nlq.showChart}
              nlqChartData={state.nlq.chartData}
              nlqInsight={state.nlq.insight}
              nlqResponse={state.nlq.response}
              onNLQuery={handlers.handleNLQuery}
              onCloseChart={() => actions.setNlqShowChart(false)}
            />

            {/* Floating Controls */}
            <FloatingControls
              isChatOpen={isChatOpen}
              onToggleChat={toggleChat}
            />

            {/* Celebrations */}
            <DashboardCelebrations
              milestone={milestone}
              onDismissMilestone={dismissMilestone}
              celebrationType={state.celebrationType}
              showCelebration={state.showCelebration}
              onCelebrationComplete={actions.hideCelebration}
            />

            {/* Onboarding */}
            <DashboardOnboarding showTutorial={profile?.show_dashboard_tutorial} />

            {/* Modals */}
            <DashboardModals
              activeModal={state.activeModal}
              onClose={actions.closeModal}
            />
          </DashboardShell>
        </DashboardErrorBoundary>
      </AIThemeProvider>
    </AppLayout>
  );
}

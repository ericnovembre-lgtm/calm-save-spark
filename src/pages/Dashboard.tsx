import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardErrorBoundary } from "@/components/error/DashboardErrorBoundary";
import { AIThemeProvider } from "@/components/dashboard/generative/AIThemeProvider";
import { useUnifiedDashboardData } from "@/hooks/useUnifiedDashboardData";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useAnnounce } from "@/components/accessibility/LiveRegionAnnouncer";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { announce } = useAnnounce();

  // Single unified data hook - replaces 11 individual hooks
  const data = useUnifiedDashboardData();

  // UI state management
  const [state, actions] = useDashboardState();

  // Consolidated handlers
  const handlers = useDashboardHandlers({
    actions,
    regenerateDashboard: data.actions.refresh,
    userId: data.user?.id,
  });

  // Screen reader announcement
  useEffect(() => {
    if (!data.generative.isLoading && data.generative.aiContext) {
      announce(
        `Dashboard ready. ${data.generative.briefing?.summary || "Your personalized financial overview."}`,
        "polite"
      );
    }
  }, [data.generative.isLoading, data.generative.aiContext, data.generative.briefing, announce]);

  return (
    <AppLayout>
      <AIThemeProvider theme={data.generative.theme}>
        <DashboardErrorBoundary sectionName="AI Dashboard">
          <DashboardShell
            isGenerating={data.generative.isLoading}
            modelName={data.generative.meta?.model}
            syncStatus={data.sync.status}
            lastSynced={data.sync.lastSynced}
            lastRefresh={data.generative.lastRefresh}
            netWorthChangePercent={data.computed.netWorthChangePercent}
            onRefresh={data.actions.refresh}
            onForceRefresh={data.actions.forceRefresh}
          >
            <DashboardStories
              stories={data.stories.items}
              activeStoryIndex={state.activeStoryIndex}
              onStoryClick={actions.setActiveStoryIndex}
              onClose={() => actions.setActiveStoryIndex(null)}
              onStoryViewed={data.stories.markAsViewed}
              isViewed={data.stories.isViewed}
            />
            <DashboardBanners
              isOffline={data.sync.isOffline}
              isSyncing={data.sync.isSyncing}
              isStale={data.sync.isStale}
              lastCachedAt={data.sync.lastCachedAt}
              transactionAlerts={data.alerts.items}
              onRefresh={data.actions.triggerSync}
              onNavigateTransactions={() => navigate("/transactions")}
              onDismissAlerts={data.alerts.markAllAsRead}
            />
            <DashboardContent
              isGenerating={data.generative.isLoading}
              generationError={data.generative.error}
              layout={data.generative.layout}
              widgets={data.generative.widgets}
              theme={data.generative.theme}
              briefing={data.generative.briefing}
              reasoning={data.generative.reasoning}
              meta={data.generative.meta}
              streamingText={data.generative.streamingText}
              aiContext={data.generative.aiContext}
              isChatOpen={data.chat.isOpen}
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
            <FloatingControls
              isChatOpen={data.chat.isOpen}
              onToggleChat={data.chat.toggle}
            />
            <DashboardCelebrations
              milestone={data.milestones.current}
              onDismissMilestone={data.milestones.dismiss}
              celebrationType={state.celebrationType}
              showCelebration={state.showCelebration}
              onCelebrationComplete={actions.hideCelebration}
            />
            <DashboardOnboarding showTutorial={data.onboarding.showTutorial} />
            <DashboardModals activeModal={state.activeModal} onClose={actions.closeModal} />
          </DashboardShell>
        </DashboardErrorBoundary>
      </AIThemeProvider>
    </AppLayout>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useClaudeGenerativeDashboard } from "@/hooks/useClaudeGenerativeDashboard";
import { useFinancialStories, FinancialStory } from "@/hooks/useFinancialStories";
import { useMilestoneDetector, Milestone } from "@/hooks/useMilestoneDetector";
import { useOfflineDashboard } from "@/hooks/useOfflineDashboard";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { useChatSidebar } from "@/hooks/useChatSidebar";
import { useTransactionAlerts, TransactionAlert } from "@/hooks/useTransactionAlerts";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type {
  DashboardLayout,
  DashboardTheme,
  DashboardBriefing,
  GenerativeWidgetSpec,
} from "@/hooks/useClaudeGenerativeDashboard";

// Re-export types for convenience
export type { TransactionAlert, FinancialStory, Milestone };

type SyncStatus = "synced" | "syncing" | "offline" | "error";

interface DashboardContext {
  timeOfDay: string;
  totalSavings: number;
  goalsCount: number;
  streak: number;
}

interface DashboardMeta {
  model: string;
  processingTimeMs: number;
  generatedAt: string;
  cached?: boolean;
}

/**
 * Unified Dashboard Data Hook
 * 
 * Consolidates 11+ individual hooks into a single organized interface.
 * This is the single source of truth for all dashboard data.
 */
export interface UnifiedDashboardData {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  userFirstName: string | null;

  // Generative Dashboard (Claude Opus 4.5)
  generative: {
    layout: DashboardLayout;
    widgets: Record<string, GenerativeWidgetSpec>;
    theme: DashboardTheme;
    briefing?: DashboardBriefing;
    reasoning?: string;
    meta?: DashboardMeta | null;
    streamingText?: string;
    aiContext?: DashboardContext | null;
    isLoading: boolean;
    error?: string | null;
    lastRefresh?: Date | null;
  };

  // Streaming State (Phase 4)
  streaming: {
    isStreaming: boolean;
    streamPhase: 'idle' | 'connecting' | 'streaming' | 'parsing' | 'complete' | 'error';
    streamedText: string;
    estimatedProgress: number;
    elapsedMs: number;
  };

  // Financial Stories
  stories: {
    items: FinancialStory[];
    markAsViewed: (id: string) => void;
    isViewed: (id: string) => boolean;
  };

  // Milestones
  milestones: {
    current: Milestone | null;
    dismiss: () => void;
  };

  // Offline & Sync
  sync: {
    status: SyncStatus;
    isOffline: boolean;
    isSyncing: boolean;
    isStale: boolean;
    lastSynced: Date;
    lastCachedAt?: Date | null;
    hasCache: boolean;
  };

  // Transaction Alerts
  alerts: {
    items: TransactionAlert[];
    markAllAsRead: () => void;
  };

  // Onboarding
  onboarding: {
    showTutorial: boolean;
  };

  // Chat Sidebar
  chat: {
    isOpen: boolean;
    toggle: () => void;
  };

  // Computed Values
  computed: {
    totalSavings: number;
    netWorthChangePercent: number;
  };

  // Actions
  actions: {
    refresh: () => Promise<void>;
    forceRefresh: () => Promise<void>;
    triggerSync: () => Promise<void>;
  };
}

export function useUnifiedDashboardData(): UnifiedDashboardData {
  // Auth
  const { user } = useAuth();

  // Chat
  const { isOpen: isChatOpen, toggle: toggleChat } = useChatSidebar();

  // Claude Generative Dashboard
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
    streamingText,
  } = useClaudeGenerativeDashboard();

  // Financial Stories
  const { stories, markAsViewed, isViewed } = useFinancialStories();

  // Milestone Detection
  const totalSavings = aiContext?.totalSavings || 0;
  const { milestone, dismissMilestone } = useMilestoneDetector(totalSavings);

  // Offline & Sync Support
  const { isOffline, isStale, lastCachedAt, hasCache } = useOfflineDashboard();
  const { isSyncing, triggerSync } = useAutoSync({
    onSync: regenerateDashboard,
    hasCachedData: hasCache,
    isStale: isStale,
  });
  const { status: syncStatus, lastSynced, forceRefresh } = useSyncStatus();

  // Transaction Alerts
  const { alerts: transactionAlerts, markAllAsRead: markAlertsRead } =
    useTransactionAlerts();

  // Onboarding - side effect only
  useOnboardingStatus(true);

  // Profile query (tutorial + user name)
  const { data: profile } = useQuery({
    queryKey: ["profile-dashboard", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("show_dashboard_tutorial, full_name")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Extract first name from full name
  const userFirstName = profile?.full_name?.split(' ')[0] || null;

  // Computed values
  const netWorthChangePercent =
    totalSavings > 0 ? ((aiContext?.streak || 0) / 100) * 10 : 0;

  // Streaming state derived from generative dashboard
  const isStreaming = !!streamingText && streamingText.length > 0 && isGenerating;
  const streamPhase = isGenerating 
    ? (streamingText ? 'streaming' : 'connecting') 
    : 'complete';

  return {
    // Authentication
    user,
    isAuthenticated: !!user,
    userFirstName,

    // Generative Dashboard
    generative: {
      layout,
      widgets,
      theme,
      briefing,
      reasoning,
      meta,
      streamingText,
      aiContext,
      isLoading: isGenerating,
      error: generationError,
      lastRefresh,
    },

    // Streaming (Phase 4)
    streaming: {
      isStreaming,
      streamPhase: streamPhase as 'idle' | 'connecting' | 'streaming' | 'parsing' | 'complete' | 'error',
      streamedText: streamingText || '',
      estimatedProgress: isStreaming ? Math.min(95, (streamingText?.length || 0) / 5) : 100,
      elapsedMs: 0, // Could be enhanced with actual timing
    },

    // Stories
    stories: {
      items: stories,
      markAsViewed,
      isViewed,
    },

    // Milestones
    milestones: {
      current: milestone,
      dismiss: dismissMilestone,
    },

    // Sync
    sync: {
      status: syncStatus,
      isOffline,
      isSyncing,
      isStale,
      lastSynced,
      lastCachedAt,
      hasCache,
    },

    // Alerts
    alerts: {
      items: transactionAlerts,
      markAllAsRead: markAlertsRead,
    },

    // Onboarding
    onboarding: {
      showTutorial: profile?.show_dashboard_tutorial ?? false,
    },

    // Chat
    chat: {
      isOpen: isChatOpen,
      toggle: toggleChat,
    },

    // Computed
    computed: {
      totalSavings,
      netWorthChangePercent,
    },

    // Actions
    actions: {
      refresh: regenerateDashboard,
      forceRefresh,
      triggerSync,
    },
  };
}

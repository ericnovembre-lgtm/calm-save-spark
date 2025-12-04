import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GenerativeWidgetSpec {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'narrative' | 'action' | 'hybrid';
  headline: string;
  body?: string;
  mood: 'calm' | 'energetic' | 'cautionary' | 'celebratory';
  urgencyScore: number;
  data?: Record<string, any>;
}

export interface DashboardLayout {
  hero: { widgetId: string; reason: string } | null;
  featured: Array<{ widgetId: string; size: 'large' | 'medium'; reason: string }>;
  grid: Array<{ widgetId: string; reason: string }>;
  hidden: string[];
}

export interface DashboardTheme {
  mood: 'calm' | 'energetic' | 'cautionary' | 'celebratory';
  accentColor: 'cyan' | 'amber' | 'emerald' | 'rose' | 'violet' | 'gold';
  backgroundIntensity: number;
  animationLevel: 'subtle' | 'moderate' | 'prominent';
}

export interface DashboardBriefing {
  greeting: string;
  summary: string;
  keyInsight: string;
  suggestedAction: string;
}

export interface GenerativeDashboardState {
  layout: DashboardLayout;
  widgets: Record<string, GenerativeWidgetSpec>;
  theme: DashboardTheme;
  briefing: DashboardBriefing;
  reasoning: string;
}

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
}

const DEFAULT_STATE: GenerativeDashboardState = {
  layout: {
    hero: { widgetId: 'balance_hero', reason: 'Default hero widget' },
    featured: [
      { widgetId: 'goal_progress', size: 'large', reason: 'Track savings progress' },
      { widgetId: 'spending_breakdown', size: 'medium', reason: 'Monitor spending' }
    ],
    grid: [
      { widgetId: 'quick_actions', reason: 'Easy access to common tasks' },
      { widgetId: 'ai_insight', reason: 'Personalized insights' }
    ],
    hidden: []
  },
  widgets: {
    balance_hero: {
      id: 'balance_hero',
      type: 'metric',
      headline: 'Your Savings',
      body: 'Loading your financial overview...',
      mood: 'calm',
      urgencyScore: 50
    },
    goal_progress: {
      id: 'goal_progress',
      type: 'chart',
      headline: 'Goal Progress',
      mood: 'calm',
      urgencyScore: 40
    },
    spending_breakdown: {
      id: 'spending_breakdown',
      type: 'chart',
      headline: 'Spending Overview',
      mood: 'calm',
      urgencyScore: 30
    },
    quick_actions: {
      id: 'quick_actions',
      type: 'action',
      headline: 'Quick Actions',
      mood: 'calm',
      urgencyScore: 20
    },
    ai_insight: {
      id: 'ai_insight',
      type: 'narrative',
      headline: 'AI Insight',
      body: 'Analyzing your finances...',
      mood: 'calm',
      urgencyScore: 35
    }
  },
  theme: {
    mood: 'calm',
    accentColor: 'cyan',
    backgroundIntensity: 0.5,
    animationLevel: 'subtle'
  },
  briefing: {
    greeting: 'Welcome back!',
    summary: 'Loading your personalized dashboard...',
    keyInsight: '',
    suggestedAction: ''
  },
  reasoning: 'Default dashboard while loading AI-generated layout'
};

export function useClaudeGenerativeDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState<GenerativeDashboardState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<DashboardContext | null>(null);
  const [meta, setMeta] = useState<DashboardMeta | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const generateDashboard = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-dashboard-layout', {
        body: {}
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.dashboard) {
        setState({
          layout: data.dashboard.layout || DEFAULT_STATE.layout,
          widgets: data.dashboard.widgets || DEFAULT_STATE.widgets,
          theme: data.dashboard.theme || DEFAULT_STATE.theme,
          briefing: data.dashboard.briefing || DEFAULT_STATE.briefing,
          reasoning: data.dashboard.reasoning || ''
        });
        setContext(data.context || null);
        setMeta(data.meta || null);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Dashboard generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate dashboard');
      // Keep default state on error
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    toast.info('Regenerating your dashboard with Claude Opus...');
    await generateDashboard();
    toast.success('Dashboard updated!');
  }, [generateDashboard]);

  // Initial generation
  useEffect(() => {
    generateDashboard();
  }, [generateDashboard]);

  // Auto-refresh on significant events (every 5 minutes while active)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        generateDashboard();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [generateDashboard]);

  return {
    ...state,
    isLoading,
    error,
    context,
    meta,
    lastRefresh,
    refresh
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
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
  cached?: boolean;
}

type LoadingPhase = 'static' | 'generating' | 'complete';

const DEFAULT_STATE: GenerativeDashboardState = {
  layout: {
    hero: { widgetId: 'balance_hero', reason: 'Default hero widget' },
    featured: [
      { widgetId: 'goal_progress', size: 'large', reason: 'Track savings progress' },
      { widgetId: 'spending_breakdown', size: 'medium', reason: 'Monitor spending' }
    ],
    grid: [
      { widgetId: 'quick_actions', reason: 'Easy access to common tasks' },
      { widgetId: 'ai_insight', reason: 'Personalized insights' },
      { widgetId: 'cashflow_forecast', reason: 'Future cash flow' },
      { widgetId: 'milestones', reason: 'Track achievements' }
    ],
    hidden: []
  },
  widgets: {
    balance_hero: {
      id: 'balance_hero',
      type: 'metric',
      headline: 'Your Savings',
      body: 'Your financial overview',
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
    },
    cashflow_forecast: {
      id: 'cashflow_forecast',
      type: 'chart',
      headline: 'Cash Flow Forecast',
      mood: 'calm',
      urgencyScore: 30
    },
    milestones: {
      id: 'milestones',
      type: 'list',
      headline: 'Achievements',
      mood: 'celebratory',
      urgencyScore: 25
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
    summary: 'Your personalized dashboard is ready.',
    keyInsight: '',
    suggestedAction: ''
  },
  reasoning: 'Default dashboard layout'
};

const GENERATION_TIMEOUT_MS = 30000; // 30 seconds
const WARNING_THRESHOLD_MS = 20000; // 20 seconds

export function useClaudeGenerativeDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState<GenerativeDashboardState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<LoadingPhase>('static');
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<DashboardContext | null>(null);
  const [meta, setMeta] = useState<DashboardMeta | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    timeoutRef.current = null;
    warningRef.current = null;
    elapsedIntervalRef.current = null;
  }, []);

  const generateDashboard = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setPhase('complete');
      return;
    }

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setPhase('generating');
    setIsLoading(true);
    setError(null);
    setElapsedTime(0);
    setIsTimedOut(false);

    const startTime = Date.now();

    // Track elapsed time
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    // Warning at 20 seconds
    warningRef.current = setTimeout(() => {
      toast.warning('Taking longer than usual...', {
        description: 'AI is still generating your personalized dashboard'
      });
    }, WARNING_THRESHOLD_MS);

    // Hard timeout at 30 seconds
    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      abortControllerRef.current?.abort();
      setIsTimedOut(true);
      setPhase('complete');
      setIsLoading(false);
      setError('AI generation timed out. Showing default layout.');
      toast.info('Showing default dashboard', {
        description: 'AI personalization took too long. You can try refreshing later.'
      });
    }, GENERATION_TIMEOUT_MS);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-dashboard-layout', {
        body: { forceRefresh }
      });

      clearAllTimers();

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
        setMeta({
          ...data.meta,
          cached: data.cached || false
        });
        setLastRefresh(new Date());
        setPhase('complete');
      }
    } catch (err) {
      clearAllTimers();
      
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      
      console.error('Dashboard generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate dashboard');
      setPhase('complete');
      // Keep default state on error
    } finally {
      setIsLoading(false);
    }
  }, [user, clearAllTimers]);

  const refresh = useCallback(async () => {
    toast.info('Regenerating your dashboard with Claude Opus...', {
      description: 'Bypassing cache for fresh personalization'
    });
    await generateDashboard(true);
    if (!isTimedOut && !error) {
      toast.success('Dashboard updated!');
    }
  }, [generateDashboard, isTimedOut, error]);

  // Initial generation
  useEffect(() => {
    generateDashboard();
    
    return () => {
      clearAllTimers();
      abortControllerRef.current?.abort();
    };
  }, [generateDashboard, clearAllTimers]);

  // Auto-refresh on significant events (every 5 minutes while active)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && phase === 'complete') {
        generateDashboard();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [generateDashboard, phase]);

  return {
    ...state,
    isLoading,
    phase,
    error,
    context,
    meta,
    lastRefresh,
    refresh,
    elapsedTime,
    isTimedOut,
    isGenerating: phase === 'generating'
  };
}

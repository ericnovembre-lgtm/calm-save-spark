import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { dashboardCache } from '@/lib/dashboard-cache';

// Request deduplication to prevent double-mount issues
const inFlightRequests = new Map<string, Promise<any>>();

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
  const [phase, setPhase] = useState<LoadingPhase>('complete'); // Start as complete with defaults
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<DashboardContext | null>(null);
  const [meta, setMeta] = useState<DashboardMeta | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [isPersonalizing, setIsPersonalizing] = useState(false); // New: background personalization
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialized = useRef(false); // Prevent duplicate initial calls
  
  // Refs to avoid stale closure issues with state in callbacks
  const phaseRef = useRef<LoadingPhase>(phase);
  const isPersonalizingRef = useRef(isPersonalizing);
  
  // Keep refs in sync with state
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { isPersonalizingRef.current = isPersonalizing; }, [isPersonalizing]);

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

    const requestKey = `dashboard-${user.id}`;

    // Check if there's already an in-flight request (deduplication)
    if (!forceRefresh && inFlightRequests.has(requestKey)) {
      try {
        await inFlightRequests.get(requestKey);
      } catch {
        // Ignore - the original request handler will deal with errors
      }
      return;
    }

    // Try to load from IndexedDB cache first for instant display
    if (!forceRefresh) {
      try {
        const cached = await dashboardCache.get(user.id);
        if (cached) {
          setState({
            layout: cached.layout || DEFAULT_STATE.layout,
            widgets: cached.widgets || DEFAULT_STATE.widgets,
            theme: cached.theme || DEFAULT_STATE.theme,
            briefing: cached.briefing || DEFAULT_STATE.briefing,
            reasoning: 'Loaded from offline cache'
          });
          setPhase('complete'); // Show cached immediately
          
          // If cache is fresh (not stale), skip network request
          if (!(cached as any).isStale) {
            return;
          }
          // Stale cache: continue with background refresh
          setIsPersonalizing(true);
        }
      } catch (e) {
        // IndexedDB unavailable, continue with network request
      }
    }

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Only show generating phase if we don't have cached data
    if (phaseRef.current !== 'complete') {
      setPhase('generating');
    }
    setIsLoading(true);
    setError(null);
    setElapsedTime(0);
    setIsTimedOut(false);
    setStreamingText('');

    // Create the request promise for deduplication
    const requestPromise = (async () => {

    const startTime = Date.now();

    // Only show timers/warnings if not doing background refresh
    if (!isPersonalizingRef.current) {
      // Track elapsed time
      elapsedIntervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);

      // Warning at 20 seconds (only if not background)
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
        setIsPersonalizing(false);
        setError('AI generation timed out. Showing default layout.');
        toast.info('Showing default dashboard', {
          description: 'AI personalization took too long. You can try refreshing later.'
        });
      }, GENERATION_TIMEOUT_MS);
    }

    try {
      // Get the user's session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error('No active session');
      }

      // Use streaming endpoint with user's JWT
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dashboard-layout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ forceRefresh, stream: true }),
          signal: abortControllerRef.current?.signal
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      
      // Check if response is SSE stream
      if (contentType?.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalData: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(jsonStr);
                
                if (parsed.type === 'streaming_text') {
                  setStreamingText(prev => prev + (parsed.content || ''));
                } else if (parsed.type === 'complete') {
                  finalData = parsed;
                }
              } catch {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }

        clearAllTimers();

        if (finalData?.dashboard) {
          const newState = {
            layout: finalData.dashboard.layout || DEFAULT_STATE.layout,
            widgets: finalData.dashboard.widgets || DEFAULT_STATE.widgets,
            theme: finalData.dashboard.theme || DEFAULT_STATE.theme,
            briefing: finalData.dashboard.briefing || DEFAULT_STATE.briefing,
            reasoning: finalData.dashboard.reasoning || ''
          };
          setState(newState);
          setContext(finalData.context || null);
          setMeta({
            ...finalData.meta,
            cached: finalData.cached || false
          });
          setLastRefresh(new Date());
          setPhase('complete');
          
          // Save to IndexedDB for offline support
          try {
            await dashboardCache.set(user.id, {
              layout: newState.layout,
              widgets: newState.widgets,
              theme: newState.theme,
              briefing: newState.briefing,
            });
          } catch (e) {
            // IndexedDB write failed, non-critical
          }
        }
      } else {
        // Non-streaming fallback (cached response)
        const data = await response.json();
        
        clearAllTimers();

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.dashboard) {
          const newState = {
            layout: data.dashboard.layout || DEFAULT_STATE.layout,
            widgets: data.dashboard.widgets || DEFAULT_STATE.widgets,
            theme: data.dashboard.theme || DEFAULT_STATE.theme,
            briefing: data.dashboard.briefing || DEFAULT_STATE.briefing,
            reasoning: data.dashboard.reasoning || ''
          };
          setState(newState);
          setContext(data.context || null);
          setMeta({
            ...data.meta,
            cached: data.cached || false
          });
          setLastRefresh(new Date());
          setPhase('complete');
          
          // Save to IndexedDB for offline support
          try {
            await dashboardCache.set(user.id, {
              layout: newState.layout,
              widgets: newState.widgets,
              theme: newState.theme,
              briefing: newState.briefing,
            });
          } catch (e) {
            // IndexedDB write failed, non-critical
          }
        }
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
      setIsPersonalizing(false);
    }
    })();

    // Store for deduplication
    inFlightRequests.set(requestKey, requestPromise);
    
    try {
      await requestPromise;
    } finally {
      inFlightRequests.delete(requestKey);
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

  // Initial generation (with deduplication guard)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    generateDashboard();
    
    return () => {
      clearAllTimers();
      abortControllerRef.current?.abort();
    };
  }, [generateDashboard, clearAllTimers]);

  // Auto-refresh every 15 minutes while active (increased from 5 min)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && phase === 'complete' && !isLoading) {
        generateDashboard();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [generateDashboard, phase, isLoading]);

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
    isGenerating: phase === 'generating',
    isPersonalizing, // New: indicates background update in progress
    streamingText
  };
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DateRange = 7 | 30 | 90;

interface FunnelDataPoint {
  step: string;
  users: number;
  rate: number;
}

interface DropOffDataPoint {
  step: string;
  dropOff: number;
  rate: number;
}

interface TimeDataPoint {
  step: string;
  avgTime: number;
  color: string;
}

interface OnboardingAnalyticsData {
  totalStarted: number;
  totalCompleted: number;
  totalSkipped: number;
  completionRate: number;
  avgCompletionTime: number;
  funnelData: FunnelDataPoint[];
  dropOffData: DropOffDataPoint[];
  timePerStep: TimeDataPoint[];
}

const STEP_ORDER = [
  { id: 'welcome', name: 'Welcome' },
  { id: 'daily-briefing', name: 'Daily Briefing' },
  { id: 'savings-balance', name: 'Savings Balance' },
  { id: 'smart-actions', name: 'Smart Actions' },
  { id: 'nlq-commander', name: 'Ask Anything' },
  { id: 'unified-fab', name: 'Quick Actions' },
  { id: 'complete', name: 'Complete' },
];

export function useOnboardingAnalyticsData(initialRange: DateRange = 30) {
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);

  const query = useQuery({
    queryKey: ['onboarding-analytics', dateRange],
    queryFn: async (): Promise<OnboardingAnalyticsData> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Fetch all spotlight events in date range
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event, properties, timestamp')
        .gte('timestamp', startDate.toISOString())
        .in('event', [
          'spotlight_tour_started',
          'spotlight_tour_completed',
          'spotlight_tour_skipped',
          'spotlight_step_view',
          'spotlight_step_complete',
          'spotlight_drop_off',
        ])
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Parse events
      const tourStarted = events?.filter(e => e.event === 'spotlight_tour_started') || [];
      const tourCompleted = events?.filter(e => e.event === 'spotlight_tour_completed') || [];
      const tourSkipped = events?.filter(e => e.event === 'spotlight_tour_skipped') || [];
      const stepViews = events?.filter(e => e.event === 'spotlight_step_view') || [];
      const stepCompletes = events?.filter(e => e.event === 'spotlight_step_complete') || [];
      const dropOffs = events?.filter(e => e.event === 'spotlight_drop_off') || [];

      const totalStarted = tourStarted.length;
      const totalCompleted = tourCompleted.length;
      const totalSkipped = tourSkipped.length;
      const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

      // Calculate average completion time from completed tours
      const completionTimes = tourCompleted
        .map(e => {
          const props = e.properties as Record<string, unknown>;
          return typeof props?.total_time_seconds === 'number' ? props.total_time_seconds : null;
        })
        .filter((t): t is number => t !== null);
      const avgCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

      // Build funnel data - count unique sessions per step
      const stepViewCounts: Record<string, Set<string>> = {};
      STEP_ORDER.forEach(step => {
        stepViewCounts[step.id] = new Set();
      });

      stepViews.forEach(e => {
        const props = e.properties as Record<string, unknown>;
        const stepId = props?.step_id as string;
        const sessionId = props?.session_id as string;
        if (stepId && sessionId && stepViewCounts[stepId]) {
          stepViewCounts[stepId].add(sessionId);
        }
      });

      // Add started sessions to welcome step
      tourStarted.forEach(e => {
        const props = e.properties as Record<string, unknown>;
        const sessionId = props?.session_id as string;
        if (sessionId) {
          stepViewCounts['welcome'].add(sessionId);
        }
      });

      // Add completed sessions to complete step
      tourCompleted.forEach(e => {
        const props = e.properties as Record<string, unknown>;
        const sessionId = props?.session_id as string;
        if (sessionId) {
          stepViewCounts['complete'].add(sessionId);
        }
      });

      const funnelData: FunnelDataPoint[] = STEP_ORDER.map((step, index) => {
        const users = stepViewCounts[step.id]?.size || 0;
        const rate = totalStarted > 0 ? (users / totalStarted) * 100 : 0;
        return { step: step.name, users, rate };
      });

      // Build drop-off data
      const dropOffData: DropOffDataPoint[] = [];
      for (let i = 0; i < STEP_ORDER.length - 1; i++) {
        const currentUsers = funnelData[i].users;
        const nextUsers = funnelData[i + 1].users;
        const dropOff = Math.max(0, currentUsers - nextUsers);
        const rate = currentUsers > 0 ? (dropOff / currentUsers) * 100 : 0;
        dropOffData.push({
          step: `${STEP_ORDER[i].name.split(' ')[0]} → ${STEP_ORDER[i + 1].name.split(' ')[0]}`,
          dropOff,
          rate,
        });
      }

      // Build time per step from step completes
      const stepTimes: Record<string, number[]> = {};
      STEP_ORDER.forEach(step => {
        stepTimes[step.id] = [];
      });

      stepCompletes.forEach(e => {
        const props = e.properties as Record<string, unknown>;
        const stepId = props?.step_id as string;
        const timeSpent = typeof props?.time_spent_seconds === 'number' 
          ? props.time_spent_seconds 
          : typeof props?.time_spent_ms === 'number' 
            ? props.time_spent_ms / 1000 
            : null;
        if (stepId && timeSpent !== null && stepTimes[stepId]) {
          stepTimes[stepId].push(timeSpent);
        }
      });

      const avgTimes = STEP_ORDER.slice(0, -1).map(step => {
        const times = stepTimes[step.id];
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      });
      const overallAvg = avgTimes.length > 0 
        ? avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length 
        : 0;

      const timePerStep: TimeDataPoint[] = STEP_ORDER.slice(0, -1).map((step, index) => {
        const avgTime = avgTimes[index];
        return {
          step: step.name,
          avgTime: parseFloat(avgTime.toFixed(1)),
          color: avgTime > overallAvg * 1.3 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
        };
      });

      return {
        totalStarted,
        totalCompleted,
        totalSkipped,
        completionRate,
        avgCompletionTime,
        funnelData,
        dropOffData,
        timePerStep,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    dateRange,
    setDateRange,
  };
}

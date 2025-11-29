/**
 * Analytics tracking for New User Spotlight onboarding
 * Tracks completion rates, step drop-offs, and time spent on each step
 */

import { useRef, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics-lazy';

const SPOTLIGHT_SESSION_KEY = 'spotlight-analytics-session';

interface StepTimingData {
  stepId: string;
  stepIndex: number;
  enterTime: number;
  exitTime?: number;
  timeSpent?: number;
  skipped: boolean;
}

interface SpotlightSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalSteps: number;
  completedSteps: number;
  skippedAt?: number;
  stepTimings: StepTimingData[];
}

export function useSpotlightAnalytics(totalSteps: number) {
  const sessionRef = useRef<SpotlightSession | null>(null);
  const currentStepRef = useRef<StepTimingData | null>(null);

  // Initialize or restore session
  const initSession = useCallback(() => {
    const sessionId = crypto.randomUUID();
    const session: SpotlightSession = {
      sessionId,
      startTime: Date.now(),
      totalSteps,
      completedSteps: 0,
      stepTimings: [],
    };
    
    sessionRef.current = session;

    trackEvent('spotlight_tour_started', {
      session_id: sessionId,
      total_steps: totalSteps,
      device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    });

    return session;
  }, [totalSteps]);

  // Track when user enters a step
  const trackStepEnter = useCallback((stepId: string, stepIndex: number) => {
    if (!sessionRef.current) {
      initSession();
    }

    // Close previous step if exists
    if (currentStepRef.current && !currentStepRef.current.exitTime) {
      currentStepRef.current.exitTime = Date.now();
      currentStepRef.current.timeSpent = 
        currentStepRef.current.exitTime - currentStepRef.current.enterTime;
    }

    const stepData: StepTimingData = {
      stepId,
      stepIndex,
      enterTime: Date.now(),
      skipped: false,
    };

    currentStepRef.current = stepData;
    sessionRef.current?.stepTimings.push(stepData);

    trackEvent('spotlight_step_view', {
      session_id: sessionRef.current?.sessionId,
      step_id: stepId,
      step_index: stepIndex,
      step_number: stepIndex + 1,
      total_steps: totalSteps,
    });
  }, [totalSteps, initSession]);

  // Track step completion (user clicked Next)
  const trackStepComplete = useCallback((stepId: string, stepIndex: number) => {
    if (!sessionRef.current) return;

    const timeSpent = currentStepRef.current 
      ? Date.now() - currentStepRef.current.enterTime 
      : 0;

    if (currentStepRef.current) {
      currentStepRef.current.exitTime = Date.now();
      currentStepRef.current.timeSpent = timeSpent;
    }

    sessionRef.current.completedSteps = stepIndex + 1;

    trackEvent('spotlight_step_complete', {
      session_id: sessionRef.current.sessionId,
      step_id: stepId,
      step_index: stepIndex,
      step_number: stepIndex + 1,
      time_spent_ms: timeSpent,
      time_spent_seconds: Math.round(timeSpent / 1000),
    });
  }, []);

  // Track when user goes back to previous step
  const trackStepBack = useCallback((fromStepId: string, fromStepIndex: number) => {
    if (!sessionRef.current) return;

    trackEvent('spotlight_step_back', {
      session_id: sessionRef.current.sessionId,
      from_step_id: fromStepId,
      from_step_index: fromStepIndex,
    });
  }, []);

  // Track when user skips the entire tour
  const trackSkip = useCallback((atStepId: string, atStepIndex: number) => {
    if (!sessionRef.current) return;

    const session = sessionRef.current;
    session.endTime = Date.now();
    session.skippedAt = atStepIndex;

    // Mark current step as skipped
    if (currentStepRef.current) {
      currentStepRef.current.skipped = true;
      currentStepRef.current.exitTime = Date.now();
      currentStepRef.current.timeSpent = 
        currentStepRef.current.exitTime - currentStepRef.current.enterTime;
    }

    const totalTime = session.endTime - session.startTime;
    const completionRate = Math.round((atStepIndex / totalSteps) * 100);

    // Calculate average time per step
    const completedStepTimings = session.stepTimings.filter(s => s.timeSpent);
    const avgTimePerStep = completedStepTimings.length > 0
      ? completedStepTimings.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / completedStepTimings.length
      : 0;

    trackEvent('spotlight_tour_skipped', {
      session_id: session.sessionId,
      skipped_at_step: atStepId,
      skipped_at_index: atStepIndex,
      steps_completed: atStepIndex,
      total_steps: totalSteps,
      completion_rate_percent: completionRate,
      total_time_ms: totalTime,
      total_time_seconds: Math.round(totalTime / 1000),
      avg_time_per_step_ms: Math.round(avgTimePerStep),
    });

    // Track as drop-off for funnel analysis
    trackEvent('spotlight_drop_off', {
      session_id: session.sessionId,
      drop_off_step: atStepId,
      drop_off_index: atStepIndex,
      completion_rate_percent: completionRate,
    });
  }, [totalSteps]);

  // Track successful completion of entire tour
  const trackCompletion = useCallback(() => {
    if (!sessionRef.current) return;

    const session = sessionRef.current;
    session.endTime = Date.now();
    session.completedSteps = totalSteps;

    // Close final step
    if (currentStepRef.current && !currentStepRef.current.exitTime) {
      currentStepRef.current.exitTime = Date.now();
      currentStepRef.current.timeSpent = 
        currentStepRef.current.exitTime - currentStepRef.current.enterTime;
    }

    const totalTime = session.endTime - session.startTime;

    // Calculate step timing statistics
    const stepTimings = session.stepTimings.filter(s => s.timeSpent);
    const avgTimePerStep = stepTimings.length > 0
      ? stepTimings.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / stepTimings.length
      : 0;
    const maxTimeStep = stepTimings.reduce((max, s) => 
      (s.timeSpent || 0) > (max?.timeSpent || 0) ? s : max, stepTimings[0]);
    const minTimeStep = stepTimings.reduce((min, s) => 
      (s.timeSpent || 0) < (min?.timeSpent || Infinity) ? s : min, stepTimings[0]);

    trackEvent('spotlight_tour_completed', {
      session_id: session.sessionId,
      total_steps: totalSteps,
      total_time_ms: totalTime,
      total_time_seconds: Math.round(totalTime / 1000),
      avg_time_per_step_ms: Math.round(avgTimePerStep),
      slowest_step: maxTimeStep?.stepId,
      slowest_step_time_ms: maxTimeStep?.timeSpent,
      fastest_step: minTimeStep?.stepId,
      fastest_step_time_ms: minTimeStep?.timeSpent,
    });

    // Send detailed step breakdown for analysis
    trackEvent('spotlight_step_breakdown', {
      session_id: session.sessionId,
      steps: stepTimings.map(s => ({
        id: s.stepId,
        index: s.stepIndex,
        time_ms: s.timeSpent,
      })),
    });
  }, [totalSteps]);

  // Get current session stats
  const getSessionStats = useCallback(() => {
    if (!sessionRef.current) return null;

    const session = sessionRef.current;
    const currentTime = Date.now();
    const elapsed = currentTime - session.startTime;

    return {
      sessionId: session.sessionId,
      elapsedMs: elapsed,
      completedSteps: session.completedSteps,
      totalSteps: session.totalSteps,
      completionRate: Math.round((session.completedSteps / session.totalSteps) * 100),
    };
  }, []);

  return {
    initSession,
    trackStepEnter,
    trackStepComplete,
    trackStepBack,
    trackSkip,
    trackCompletion,
    getSessionStats,
  };
}

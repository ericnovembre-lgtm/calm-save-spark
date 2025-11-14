/**
 * Enhanced analytics tracking for onboarding flow
 * Tracks user behavior, drop-off points, and completion metrics
 */

import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics-lazy';
import { useOnboardingABTest } from './useOnboardingABTest';

interface OnboardingAnalyticsConfig {
  userId: string | null;
  totalSteps: number;
  sessionId?: string;
}

interface StepMetrics {
  stepName: string;
  stepNumber: number;
  timeSpent: number;
  interactionCount: number;
  errorCount: number;
  helpViewed: boolean;
  videoWatched: boolean;
}

export const useOnboardingAnalytics = ({ 
  userId, 
  totalSteps,
  sessionId = crypto.randomUUID()
}: OnboardingAnalyticsConfig) => {
  const startTimeRef = useRef<number>(Date.now());
  const stepStartTimeRef = useRef<number>(Date.now());
  const stepMetricsRef = useRef<Record<string, StepMetrics>>({});
  const interactionCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  
  const abTest = useOnboardingABTest({ userId, totalSteps });

  // Track onboarding start
  useEffect(() => {
    trackEvent('onboarding_started', {
      user_id: userId,
      session_id: sessionId,
      variant: abTest.variant,
      timestamp: new Date().toISOString(),
      device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
    });
  }, [userId, sessionId, abTest.variant]);

  // Track step entry with detailed metrics
  const trackStepEntry = useCallback((stepName: string, stepNumber: number) => {
    stepStartTimeRef.current = Date.now();
    interactionCountRef.current = 0;
    errorCountRef.current = 0;

    // Initialize step metrics
    stepMetricsRef.current[stepName] = {
      stepName,
      stepNumber,
      timeSpent: 0,
      interactionCount: 0,
      errorCount: 0,
      helpViewed: false,
      videoWatched: false,
    };

    trackEvent('onboarding_step_view', {
      session_id: sessionId,
      step_name: stepName,
      step_number: stepNumber,
      total_steps: totalSteps,
      variant: abTest.variant,
      time_since_start: Date.now() - startTimeRef.current,
    });

    abTest.trackStepStart(stepName, stepNumber);
  }, [sessionId, totalSteps, abTest]);

  // Track step completion with comprehensive data
  const trackStepComplete = useCallback((stepName: string, stepNumber: number, formData?: Record<string, any>) => {
    const timeSpent = Date.now() - stepStartTimeRef.current;
    const metrics = stepMetricsRef.current[stepName];

    if (metrics) {
      metrics.timeSpent = timeSpent;
      metrics.interactionCount = interactionCountRef.current;
      metrics.errorCount = errorCountRef.current;
    }

    trackEvent('onboarding_step_complete', {
      session_id: sessionId,
      step_name: stepName,
      step_number: stepNumber,
      total_steps: totalSteps,
      variant: abTest.variant,
      time_spent_ms: timeSpent,
      interaction_count: interactionCountRef.current,
      error_count: errorCountRef.current,
      help_viewed: metrics?.helpViewed || false,
      video_watched: metrics?.videoWatched || false,
      form_data_keys: formData ? Object.keys(formData) : [],
      time_since_start: Date.now() - startTimeRef.current,
    });

    abTest.trackStepComplete(stepName, stepNumber);
  }, [sessionId, totalSteps, abTest]);

  // Track user interactions within a step
  const trackInteraction = useCallback((stepName: string, interactionType: string, details?: Record<string, any>) => {
    interactionCountRef.current++;

    trackEvent('onboarding_interaction', {
      session_id: sessionId,
      step_name: stepName,
      interaction_type: interactionType,
      variant: abTest.variant,
      ...details,
    });
  }, [sessionId, abTest.variant]);

  // Track errors and validation issues
  const trackError = useCallback((stepName: string, errorType: string, errorMessage?: string) => {
    errorCountRef.current++;

    trackEvent('onboarding_error', {
      session_id: sessionId,
      step_name: stepName,
      error_type: errorType,
      error_message: errorMessage,
      variant: abTest.variant,
      time_since_step_start: Date.now() - stepStartTimeRef.current,
    });
  }, [sessionId, abTest.variant]);

  // Track help overlay usage
  const trackHelpViewed = useCallback((stepName: string, helpTopic?: string) => {
    const metrics = stepMetricsRef.current[stepName];
    if (metrics) {
      metrics.helpViewed = true;
    }

    trackEvent('onboarding_help_viewed', {
      session_id: sessionId,
      step_name: stepName,
      help_topic: helpTopic,
      variant: abTest.variant,
    });
  }, [sessionId, abTest.variant]);

  // Track video interactions
  const trackVideoInteraction = useCallback((stepName: string, action: 'play' | 'pause' | 'complete', videoId?: string) => {
    if (action === 'complete') {
      const metrics = stepMetricsRef.current[stepName];
      if (metrics) {
        metrics.videoWatched = true;
      }
    }

    trackEvent('onboarding_video_interaction', {
      session_id: sessionId,
      step_name: stepName,
      video_id: videoId,
      action,
      variant: abTest.variant,
    });
  }, [sessionId, abTest.variant]);

  // Track drop-off
  const trackDropOff = useCallback((stepName: string, stepNumber: number, reason?: string) => {
    const totalTime = Date.now() - startTimeRef.current;
    const completionRate = (stepNumber / totalSteps) * 100;

    trackEvent('onboarding_drop_off', {
      session_id: sessionId,
      step_name: stepName,
      step_number: stepNumber,
      total_steps: totalSteps,
      completion_rate: completionRate,
      total_time_ms: totalTime,
      variant: abTest.variant,
      reason: reason || 'unknown',
      step_metrics: stepMetricsRef.current,
    });

    abTest.trackDropOff(stepName, stepNumber, reason);
  }, [sessionId, totalSteps, abTest]);

  // Track successful completion
  const trackCompletion = useCallback((finalData?: Record<string, any>) => {
    const totalTime = Date.now() - startTimeRef.current;

    trackEvent('onboarding_completed', {
      session_id: sessionId,
      user_id: userId,
      variant: abTest.variant,
      total_time_ms: totalTime,
      total_time_minutes: Math.round(totalTime / 60000),
      total_steps: totalSteps,
      total_interactions: Object.values(stepMetricsRef.current).reduce((sum, m) => sum + m.interactionCount, 0),
      total_errors: Object.values(stepMetricsRef.current).reduce((sum, m) => sum + m.errorCount, 0),
      help_viewed_count: Object.values(stepMetricsRef.current).filter(m => m.helpViewed).length,
      videos_watched_count: Object.values(stepMetricsRef.current).filter(m => m.videoWatched).length,
      step_metrics: stepMetricsRef.current,
      final_data_keys: finalData ? Object.keys(finalData) : [],
    });

    abTest.trackCompletion();
  }, [sessionId, userId, totalSteps, abTest]);

  // Track field-level interactions for micro-optimization
  const trackFieldInteraction = useCallback((
    stepName: string,
    fieldName: string,
    interactionType: 'focus' | 'blur' | 'change' | 'tooltip_shown'
  ) => {
    abTest.trackFieldInteraction(stepName, fieldName, interactionType);
  }, [abTest]);

  return {
    variant: abTest.variant,
    trackStepEntry,
    trackStepComplete,
    trackInteraction,
    trackError,
    trackHelpViewed,
    trackVideoInteraction,
    trackDropOff,
    trackCompletion,
    trackFieldInteraction,
  };
};

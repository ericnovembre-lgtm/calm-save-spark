/**
 * A/B Testing hook for onboarding optimization
 * Tracks completion rates, time-to-complete, and drop-off points
 */

import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

interface OnboardingABTestConfig {
  /** User ID for consistent variant assignment */
  userId: string | null;
  /** Total number of onboarding steps */
  totalSteps: number;
}

interface OnboardingMetrics {
  variant: 'control' | 'variant_a';
  startTime: number;
  stepTimes: Record<string, number>;
  dropOffPoints: string[];
}

/**
 * Assigns user to A/B test variant based on user ID hash
 * Uses consistent hashing to ensure same user gets same variant
 */
const getVariant = (userId: string | null): 'control' | 'variant_a' => {
  if (!userId) return 'control';
  
  // Simple hash function for consistent variant assignment
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // 50/50 split
  return Math.abs(hash) % 2 === 0 ? 'control' : 'variant_a';
};

export const useOnboardingABTest = ({ userId, totalSteps }: OnboardingABTestConfig) => {
  const [variant, setVariant] = useState<'control' | 'variant_a'>('control');
  const metricsRef = useRef<OnboardingMetrics>({
    variant: 'control',
    startTime: Date.now(),
    stepTimes: {},
    dropOffPoints: [],
  });

  // Assign variant on mount
  useEffect(() => {
    const assignedVariant = getVariant(userId);
    setVariant(assignedVariant);
    metricsRef.current.variant = assignedVariant;

    // Track variant assignment
    trackEvent('onboarding_variant_assigned', {
      variant: assignedVariant,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }, [userId]);

  /**
   * Track step entry
   */
  const trackStepStart = (step: string, stepNumber: number) => {
    metricsRef.current.stepTimes[step] = Date.now();

    trackEvent('onboarding_ab_step_start', {
      variant,
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      time_since_start: Date.now() - metricsRef.current.startTime,
    });
  };

  /**
   * Track step completion
   */
  const trackStepComplete = (step: string, stepNumber: number) => {
    const stepStartTime = metricsRef.current.stepTimes[step];
    const timeOnStep = stepStartTime ? Date.now() - stepStartTime : 0;

    trackEvent('onboarding_ab_step_complete', {
      variant,
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      time_on_step_ms: timeOnStep,
      time_since_start: Date.now() - metricsRef.current.startTime,
    });
  };

  /**
   * Track step skip
   */
  const trackStepSkip = (step: string, stepNumber: number) => {
    const stepStartTime = metricsRef.current.stepTimes[step];
    const timeOnStep = stepStartTime ? Date.now() - stepStartTime : 0;

    trackEvent('onboarding_ab_step_skip', {
      variant,
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      time_on_step_ms: timeOnStep,
      time_since_start: Date.now() - metricsRef.current.startTime,
    });
  };

  /**
   * Track drop-off (user leaves onboarding)
   */
  const trackDropOff = (step: string, stepNumber: number, reason?: string) => {
    metricsRef.current.dropOffPoints.push(step);

    trackEvent('onboarding_ab_drop_off', {
      variant,
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      time_since_start: Date.now() - metricsRef.current.startTime,
      reason: reason || 'unknown',
      drop_off_points: metricsRef.current.dropOffPoints,
    });
  };

  /**
   * Track successful onboarding completion
   */
  const trackCompletion = () => {
    const totalTime = Date.now() - metricsRef.current.startTime;

    trackEvent('onboarding_ab_completed', {
      variant,
      total_steps: totalSteps,
      total_time_ms: totalTime,
      total_time_minutes: Math.round(totalTime / 60000),
      step_times: metricsRef.current.stepTimes,
      completion_rate: 100, // Completed all steps
    });
  };

  /**
   * Track form field interactions for micro-optimization
   */
  const trackFieldInteraction = (
    step: string,
    fieldName: string,
    interactionType: 'focus' | 'blur' | 'change' | 'tooltip_shown'
  ) => {
    trackEvent('onboarding_ab_field_interaction', {
      variant,
      step,
      field_name: fieldName,
      interaction_type: interactionType,
      time_since_start: Date.now() - metricsRef.current.startTime,
    });
  };

  return {
    variant,
    trackStepStart,
    trackStepComplete,
    trackStepSkip,
    trackDropOff,
    trackCompletion,
    trackFieldInteraction,
  };
};

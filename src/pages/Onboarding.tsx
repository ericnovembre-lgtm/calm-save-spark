import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { announce } from "@/components/layout/LiveRegion";
import { checkAchievements } from "@/lib/achievements";
import { useOnboardingABTest } from "@/hooks/useOnboardingABTest";
import { useOnboardingAnalytics } from "@/hooks/useOnboardingAnalytics";
import { useWebVitals } from "@/hooks/useWebVitals";
import { ProgressBarPremium } from "@/components/onboarding/ProgressBarPremium";
import { StepTransition } from "@/components/onboarding/StepTransition";
import { HelpOverlay } from "@/components/onboarding/HelpOverlay";
import { AccessibilityWrapper } from "@/components/onboarding/AccessibilityWrapper";
import { PerformanceOptimizedStep } from "@/components/onboarding/PerformanceOptimizedStep";
import SavingsDemo from "@/components/onboarding/SavingsDemo";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import AccountSetupStep from "@/components/onboarding/AccountSetupStep";
import FirstGoalStep from "@/components/onboarding/FirstGoalStep";
import AutomationStep from "@/components/onboarding/AutomationStep";
import DashboardPreview from "@/components/onboarding/DashboardPreview";
import EnhancedCompleteStep from "@/components/onboarding/EnhancedCompleteStep";
import { prefetchStepResources, cacheFormData, getCachedFormData, clearFormCache, hasGoodPerformance } from "@/utils/onboarding-optimization";

const STEPS = ['demo', 'welcome', 'account', 'goal', 'automation', 'preview', 'complete'] as const;
type Step = typeof STEPS[number];

const STEP_LABELS = ['Demo', 'Welcome', 'Profile', 'Goals', 'Automate', 'Preview', 'Complete'];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('demo');
  const [userId, setUserId] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [onboardingStartTime] = useState(Date.now());
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formCache, setFormCache] = useState<Record<string, any>>(() => getCachedFormData() || {});
  
  // A/B testing tracking
  const abTest = useOnboardingABTest({
    userId,
    totalSteps: STEPS.length,
  });

  // Enhanced analytics tracking
  const analytics = useOnboardingAnalytics({
    userId,
    totalSteps: STEPS.length,
  });

  // Enable Web Vitals tracking in production
  useWebVitals(!import.meta.env.DEV);

  // Check device performance for animation optimization
  const highPerformance = hasGoodPerformance();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Allow viewing demo step without auth
      if (!session && currentStep !== 'demo') {
        navigate('/auth', { state: { returnTo: '/onboarding' } });
        return;
      }
      
      if (!session) {
        setCurrentStep('demo');
        return;
      }
      
      // Check if user has already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.onboarding_completed) {
        navigate('/dashboard');
        return;
      }
      
      // Restore saved onboarding step
      if (profile?.onboarding_step && STEPS.includes(profile.onboarding_step as Step)) {
        const savedStep = profile.onboarding_step as Step;
        if (savedStep !== 'welcome') {
          setIsResuming(true);
        }
        setCurrentStep(savedStep);
      }
      
      setUserId(session.user.id);
      
      // Track onboarding started
      trackEvent('onboarding_started', {});
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (currentStep && userId) {
      const stepNumber = STEPS.indexOf(currentStep) + 1;
      
      trackEvent('onboarding_step_started', { step: currentStep });
      announce(`Step ${stepNumber} of ${STEPS.length}: ${currentStep}`, 'polite');
      
      // A/B test tracking
      abTest.trackStepStart(currentStep, stepNumber);

      // Enhanced analytics tracking
      analytics.trackStepEntry(currentStep, stepNumber);

      // Prefetch next step resources
      if (stepNumber < STEPS.length) {
        const nextStep = STEPS[stepNumber];
        prefetchStepResources(nextStep);
      }
      
      // Save current step to database
      supabase
        .from('profiles')
        .update({ onboarding_step: currentStep })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) {
            console.error('Error saving onboarding step:', error);
          }
        });
    }
  }, [currentStep, userId, abTest, analytics]);

  // Cache form data
  useEffect(() => {
    cacheFormData(formCache);
  }, [formCache]);

  // Track drop-off on unmount
  useEffect(() => {
    return () => {
      if (currentStep !== 'complete' && userId) {
        const stepNumber = STEPS.indexOf(currentStep) + 1;
        analytics.trackDropOff(currentStep, stepNumber, 'navigation_away');
      }
    };
  }, [currentStep, userId, analytics]);

  const handleNext = async (data?: { skipStep?: boolean }) => {
    const currentIndex = STEPS.indexOf(currentStep);
    const stepNumber = currentIndex + 1;
    
    if (data?.skipStep) {
      trackEvent('onboarding_step_skipped', { step: currentStep });
      abTest.trackStepSkip(currentStep, stepNumber);
      analytics.trackInteraction(currentStep, 'skip_step');
    } else {
      trackEvent('onboarding_step_completed', { step: currentStep });
      abTest.trackStepComplete(currentStep, stepNumber);
      analytics.trackStepComplete(currentStep, stepNumber, formCache);
    }
    
    setDirection('forward');
    
    // Update onboarding progress
    if (userId) {
      const status = data?.skipStep ? 'skipped' : 'completed';
      await supabase
        .from('profiles')
        .update({
          onboarding_progress: {
            [currentStep]: status
          }
        })
        .eq('id', userId);
    }
    
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    const stepNumber = currentIndex + 1;
    
    analytics.trackInteraction(currentStep, 'back_button');
    setDirection('backward');
    
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleNavigateToStep = (step: string) => {
    if (STEPS.includes(step as Step)) {
      setCurrentStep(step as Step);
    }
  };

  const handleComplete = async () => {
    if (!userId) return;
    
    try {
      // Track A/B test completion
      abTest.trackCompletion();
      
      // Track enhanced analytics completion
      analytics.trackCompletion(formCache);
      
      // Mark onboarding as completed and request dashboard tutorial
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 'complete',
          show_dashboard_tutorial: true // Flag to show tutorial on dashboard
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Onboarding completion error:', error);
        analytics.trackError('complete', 'completion_error', error.message);
      } else {
        const completionTime = Date.now() - onboardingStartTime;
        trackEvent('onboarding_completed', {
          total_time_ms: completionTime,
          total_steps: STEPS.length,
          variant: analytics.variant,
        });
        
        // Clear form cache
        clearFormCache();
        
        // Check for onboarding achievement
        await checkAchievements('onboarding_completed', {});
        
        announce('Onboarding completed! Redirecting to dashboard...', 'assertive');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      analytics.trackError('complete', 'exception', error.message);
    }
  };

  if (!userId && currentStep !== 'demo') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="pt-8">
        <ProgressBarPremium 
          currentStep={currentStepIndex} 
          totalSteps={STEPS.length - 1} 
          stepLabels={STEP_LABELS}
        />
      </div>
      
      {isResuming && (
        <div className="bg-primary/10 border-b border-primary/20 py-3 px-4 text-center">
          <p className="text-sm font-medium text-foreground">
            👋 Welcome back! Continuing from where you left off
          </p>
        </div>
      )}
      
      <main className="flex-1 flex items-center justify-center p-4">
        <StepTransition stepKey={currentStep} direction={direction}>
          <AccessibilityWrapper
            stepName={STEP_LABELS[currentStepIndex] || currentStep}
            stepNumber={currentStepIndex}
            totalSteps={STEPS.length}
            onNext={currentStep !== 'complete' ? handleNext : undefined}
            onPrevious={currentStep !== 'demo' && currentStep !== 'welcome' ? handlePrevious : undefined}
            canGoNext={currentStep !== 'complete'}
            canGoPrevious={currentStep !== 'demo' && currentStep !== 'welcome'}
          >
            <PerformanceOptimizedStep
              stepName={currentStep}
              enablePerformanceTracking={highPerformance}
            >
              {currentStep === 'demo' && (
                <SavingsDemo onGetStarted={() => {
                  if (userId) {
                    handleNext();
                  } else {
                    navigate('/auth', { state: { returnTo: '/onboarding' } });
                  }
                }} />
              )}
              {currentStep === 'welcome' && (
                <WelcomeStep onNext={handleNext} />
              )}
              {currentStep === 'account' && (
                <AccountSetupStep 
                  userId={userId}
                  onNext={handleNext} 
                  onPrevious={handlePrevious} 
                />
              )}
              {currentStep === 'goal' && (
                <FirstGoalStep 
                  userId={userId}
                  onNext={handleNext} 
                  onPrevious={handlePrevious}
                  abTest={abTest}
                />
              )}
              {currentStep === 'automation' && (
                <AutomationStep 
                  userId={userId}
                  onNext={handleNext} 
                  onPrevious={handlePrevious} 
                />
              )}
              {currentStep === 'preview' && (
                <DashboardPreview
                  userId={userId}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onNavigateToStep={handleNavigateToStep}
                />
              )}
              {currentStep === 'complete' && (
                <EnhancedCompleteStep 
                  onComplete={handleComplete}
                  completionTime={Math.floor((Date.now() - onboardingStartTime) / 1000)}
                  formData={formCache}
                  onPrevious={handlePrevious}
                />
              )}
            </PerformanceOptimizedStep>
          </AccessibilityWrapper>
        </StepTransition>
      </main>

      {/* Help Overlay - Available throughout onboarding */}
      <HelpOverlay />
    </div>
  );
};

export default Onboarding;

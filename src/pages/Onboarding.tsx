import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { announce } from "@/components/layout/LiveRegion";
import ProgressBar from "@/components/onboarding/ProgressBar";
import SavingsDemo from "@/components/onboarding/SavingsDemo";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import AccountSetupStep from "@/components/onboarding/AccountSetupStep";
import FirstGoalStep from "@/components/onboarding/FirstGoalStep";
import AutomationStep from "@/components/onboarding/AutomationStep";
import DashboardPreview from "@/components/onboarding/DashboardPreview";
import CompleteStep from "@/components/onboarding/CompleteStep";

const STEPS = ['demo', 'welcome', 'account', 'goal', 'automation', 'preview', 'complete'] as const;
type Step = typeof STEPS[number];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [userId, setUserId] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);

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
      trackEvent('onboarding_step_started', { step: currentStep });
      announce(`Step ${STEPS.indexOf(currentStep) + 1} of ${STEPS.length}: ${currentStep}`, 'polite');
      
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
  }, [currentStep, userId]);

  const handleNext = async (data?: { skipStep?: boolean }) => {
    const currentIndex = STEPS.indexOf(currentStep);
    
    if (data?.skipStep) {
      trackEvent('onboarding_step_skipped', { step: currentStep });
    } else {
      trackEvent('onboarding_step_completed', { step: currentStep });
    }
    
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
      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 'complete' 
        })
        .eq('id', userId);
      
      trackEvent('onboarding_completed', {});
      announce('Onboarding completed! Redirecting to pricing...', 'assertive');
      
      setTimeout(() => {
        navigate('/pricing');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProgressBar currentStep={currentStepIndex + 1} totalSteps={STEPS.length} />
      
      {isResuming && (
        <div className="bg-primary/10 border-b border-primary/20 py-3 px-4 text-center">
          <p className="text-sm font-medium text-foreground">
            👋 Welcome back! Continuing from where you left off
          </p>
        </div>
      )}
      
      <main className="flex-1 flex items-center justify-center p-4">
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
          <CompleteStep onComplete={handleComplete} />
        )}
      </main>
    </div>
  );
};

export default Onboarding;

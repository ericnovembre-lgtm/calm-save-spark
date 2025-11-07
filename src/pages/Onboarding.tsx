import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { announce } from "@/components/layout/LiveRegion";
import ProgressBar from "@/components/onboarding/ProgressBar";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import AccountSetupStep from "@/components/onboarding/AccountSetupStep";
import FirstGoalStep from "@/components/onboarding/FirstGoalStep";
import AutomationStep from "@/components/onboarding/AutomationStep";
import CompleteStep from "@/components/onboarding/CompleteStep";

const STEPS = ['welcome', 'account', 'goal', 'automation', 'complete'] as const;
type Step = typeof STEPS[number];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth', { state: { returnTo: '/onboarding' } });
        return;
      }
      setUserId(session.user.id);
      
      // Track onboarding started
      trackEvent('onboarding_started', {});
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (currentStep) {
      trackEvent('onboarding_step_started', { step: currentStep });
      announce(`Step ${STEPS.indexOf(currentStep) + 1} of ${STEPS.length}: ${currentStep}`, 'polite');
    }
  }, [currentStep]);

  const handleNext = (data?: { skipStep?: boolean }) => {
    const currentIndex = STEPS.indexOf(currentStep);
    
    if (data?.skipStep) {
      trackEvent('onboarding_step_skipped', { step: currentStep });
    } else {
      trackEvent('onboarding_step_completed', { step: currentStep });
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
      
      <main className="flex-1 flex items-center justify-center p-4">
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
        {currentStep === 'complete' && (
          <CompleteStep onComplete={handleComplete} />
        )}
      </main>
    </div>
  );
};

export default Onboarding;
